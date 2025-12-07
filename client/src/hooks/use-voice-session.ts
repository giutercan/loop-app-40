import { useState, useRef, useCallback } from "react";
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

export function useVoiceSession(options: UseVoiceSessionOptions = {}): UseVoiceSessionReturn {
  const { onTranscript, onError, voice = "nova" } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") 
          ? "audio/webm" 
          : "audio/mp4"
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err: any) {
      const errorMsg = err.name === "NotAllowedError" 
        ? "Microphone access denied. Please allow microphone access to use voice features."
        : "Failed to start recording. Please check your microphone.";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || "audio/webm" 
          });
          
          if (audioBlob.size < 1000) {
            setIsProcessing(false);
            setError("Recording too short. Please speak longer.");
            resolve(null);
            return;
          }

          const response = await fetch("/api/companion/voice/transcribe", {
            method: "POST",
            headers: {
              "Content-Type": audioBlob.type,
            },
            body: audioBlob,
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          setIsProcessing(false);
          
          if (data.success && data.text) {
            onTranscript?.(data.text);
            resolve(data.text);
          } else {
            setError("Could not understand speech. Please try again.");
            resolve(null);
          }
        } catch (err: any) {
          setIsProcessing(false);
          const errorMsg = "Failed to transcribe audio. Please try again.";
          setError(errorMsg);
          onError?.(errorMsg);
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [onTranscript, onError]);

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
