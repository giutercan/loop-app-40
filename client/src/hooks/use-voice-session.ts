import { useState, useRef, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface UseVoiceSessionOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}

interface UseVoiceSessionReturn {
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  playAudio: (text: string) => Promise<void>;
  stopAudio: () => void;
  error: string | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useVoiceSession(options: UseVoiceSessionOptions = {}): UseVoiceSessionReturn {
  const { onTranscript, onError, voice = "nova" } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<string>("");
  const resolveRef = useRef<((value: string | null) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        if (audioElementRef.current.src) {
          URL.revokeObjectURL(audioElementRef.current.src);
        }
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        const errorMsg = "Speech recognition is not supported in this browser. Please use Chrome or Edge.";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      transcriptRef.current = "";
      
      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        transcriptRef.current = finalTranscript || interimTranscript;
      };
      
      recognition.onerror = (event) => {
        setIsRecording(false);
        setIsProcessing(false);
        
        let errorMsg = "Speech recognition error. Please try again.";
        if (event.error === "not-allowed") {
          errorMsg = "Microphone access denied. Please allow microphone access to use voice features.";
        } else if (event.error === "no-speech") {
          errorMsg = "No speech detected. Please speak clearly and try again.";
        } else if (event.error === "network") {
          errorMsg = "Network error. Please check your connection and try again.";
        }
        
        setError(errorMsg);
        onError?.(errorMsg);
        
        if (resolveRef.current) {
          resolveRef.current(null);
          resolveRef.current = null;
        }
      };
      
      recognition.onend = () => {
        if (isRecording) {
          setIsRecording(false);
          setIsProcessing(false);
          
          const transcript = transcriptRef.current.trim();
          if (transcript && resolveRef.current) {
            onTranscript?.(transcript);
            resolveRef.current(transcript);
          } else if (resolveRef.current) {
            resolveRef.current(null);
          }
          resolveRef.current = null;
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err: any) {
      const errorMsg = "Failed to start voice recognition. Please try again.";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [onTranscript, onError, isRecording]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      resolveRef.current = resolve;
      setIsProcessing(true);
      
      try {
        recognitionRef.current.stop();
      } catch {
        setIsRecording(false);
        setIsProcessing(false);
        
        const transcript = transcriptRef.current.trim();
        if (transcript) {
          onTranscript?.(transcript);
          resolve(transcript);
        } else {
          resolve(null);
        }
        resolveRef.current = null;
      }
    });
  }, [onTranscript]);

  const playAudio = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setError(null);
      setIsPlaying(true);
      
      const response = await apiRequest("POST", "/api/companion/voice/speak", {
        text,
        voice,
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        URL.revokeObjectURL(audioElementRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setError("Failed to play audio");
      };
      
      await audio.play();
    } catch (err: any) {
      setIsPlaying(false);
      const errorMsg = "Failed to generate speech. Please try again.";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [voice, onError]);

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      if (audioElementRef.current.src) {
        URL.revokeObjectURL(audioElementRef.current.src);
      }
      audioElementRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    isPlaying,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    error,
  };
}
