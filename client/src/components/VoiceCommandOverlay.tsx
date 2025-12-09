import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Square, 
  Loader2, 
  X, 
  Sparkles,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Target,
  FileText,
  BookOpen,
  Users,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceField {
  id: string;
  label: string;
  category: "greensheet" | "story" | "meeting" | "navigation";
  icon: typeof Mic;
}

interface VoiceCommandOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (transcript: string, targetField?: string) => void;
  currentPhase?: "before" | "during" | "after" | "test";
  availableFields: VoiceField[];
  activeField?: string;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstanceLocal {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const VOICE_COMMANDS = [
  { command: "fill objective", action: "target", target: "objective", description: "Fill Call Objective" },
  { command: "fill opening statement", action: "target", target: "openingStatement", description: "Fill Opening Statement" },
  { command: "fill outcome", action: "target", target: "desiredOutcome", description: "Fill Desired Outcome" },
  { command: "fill commitment", action: "target", target: "bestActionCommitment", description: "Fill Best Action" },
  { command: "fill message", action: "target", target: "singleMessage", description: "Fill Single Message" },
  { command: "fill hook", action: "target", target: "startingHook", description: "Fill Starting Hook" },
  { command: "fill hero", action: "target", target: "heroCharacter", description: "Fill Hero/Characters" },
  { command: "fill opening line", action: "target", target: "openingLine", description: "Fill Opening Line" },
  { command: "fill turning point", action: "target", target: "turningPoint", description: "Fill Turning Point" },
  { command: "fill meaning", action: "target", target: "momentOfMeaning", description: "Fill Moment of Meaning" },
  { command: "fill takeaway", action: "target", target: "explicitTakeaway", description: "Fill Takeaway" },
  { command: "fill action", action: "target", target: "callToAction", description: "Fill Call to Action" },
  { command: "go to before", action: "phase", phase: "before", description: "Switch to BEFORE phase" },
  { command: "go to during", action: "phase", phase: "during", description: "Switch to DURING phase" },
  { command: "go to after", action: "phase", phase: "after", description: "Switch to AFTER phase" },
  { command: "stop", action: "stop", description: "Stop listening" },
  { command: "cancel", action: "cancel", description: "Cancel and close" },
];

export function VoiceCommandOverlay({
  isOpen,
  onClose,
  onTranscript,
  currentPhase = "before",
  availableFields,
  activeField
}: VoiceCommandOverlayProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [targetField, setTargetField] = useState<string | undefined>(activeField);
  const [showCommands, setShowCommands] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstanceLocal | null>(null);
  const transcriptAccumulatorRef = useRef<string>("");

  const startListening = useCallback(() => {
    try {
      setErrorMessage(null);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setErrorMessage("Speech recognition not supported. Please use Chrome or Edge.");
        setStatus("error");
        return;
      }

      const recognition = new SpeechRecognition() as unknown as SpeechRecognitionInstanceLocal;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      transcriptAccumulatorRef.current = "";
      setInterimTranscript("");
      setFinalTranscript("");
      
      recognition.onstart = () => {
        setIsListening(true);
        setStatus("listening");
      };
      
      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        
        const combinedText = (interim + " " + final).toLowerCase().trim();
        
        for (const cmd of VOICE_COMMANDS) {
          if (combinedText === cmd.command || combinedText.endsWith(cmd.command)) {
            if (cmd.action === "stop") {
              recognition.stop();
              return;
            } else if (cmd.action === "cancel") {
              recognition.abort();
              onClose();
              return;
            } else if (cmd.action === "target" && cmd.target) {
              setTargetField(cmd.target);
              toast({
                title: "Target field set",
                description: `Now recording for: ${cmd.description}`,
              });
              transcriptAccumulatorRef.current = "";
              setInterimTranscript("");
              setFinalTranscript("");
              return;
            } else if (cmd.action === "phase" && cmd.phase) {
              onTranscript(`__PHASE__${cmd.phase}`, undefined);
              toast({
                title: "Switching phase",
                description: `Moving to ${cmd.phase.toUpperCase()} phase`,
              });
              transcriptAccumulatorRef.current = "";
              setInterimTranscript("");
              setFinalTranscript("");
              return;
            }
          }
        }
        
        if (final.trim()) {
          transcriptAccumulatorRef.current += final.trim() + " ";
          setFinalTranscript(transcriptAccumulatorRef.current.trim());
        }
        
        setInterimTranscript(interim);
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        setStatus("error");
        
        let msg = "Speech recognition error. Please try again.";
        if (event.error === "not-allowed") {
          msg = "Microphone access denied. Please allow microphone access.";
        } else if (event.error === "no-speech") {
          msg = "No speech detected. Please speak clearly.";
        } else if (event.error === "network") {
          msg = "Network error. Please check your connection.";
        } else if (event.error === "aborted") {
          msg = "";
        }
        
        if (msg) {
          setErrorMessage(msg);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setStatus("processing");
        
        const transcript = transcriptAccumulatorRef.current.trim();
        
        if (transcript) {
          onTranscript(transcript, targetField);
          toast({
            title: "Voice input captured",
            description: targetField 
              ? `Added to ${availableFields.find(f => f.id === targetField)?.label || targetField}`
              : "Transcript ready",
          });
        } else {
          toast({
            title: "No content captured",
            description: "Speak your content after saying the field name, then say 'stop'",
            variant: "default",
          });
        }
        
        transcriptAccumulatorRef.current = "";
        
        setTimeout(() => {
          setStatus("idle");
        }, 500);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage("Failed to start voice recognition.");
      setStatus("error");
    }
  }, [targetField, onTranscript, onClose, toast, availableFields]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);
    setStatus("idle");
    setInterimTranscript("");
    setFinalTranscript("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !isListening && status === "idle") {
      startListening();
    }
  }, [isOpen, isListening, status, startListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (activeField) {
      setTargetField(activeField);
    }
  }, [activeField]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "greensheet": return Target;
      case "story": return BookOpen;
      case "meeting": return Users;
      case "navigation": return ArrowRight;
      default: return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 border-2 border-primary/30 shadow-2xl">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : status === "processing" 
                    ? "bg-yellow-500"
                    : "bg-primary"
              )}>
                {isListening ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : status === "processing" ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">Voice Command</h3>
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Listening... speak now" : status === "processing" ? "Processing..." : "Ready"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelListening} data-testid="button-close-voice">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {targetField && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-center gap-2 text-sm">
                <Pencil className="w-4 h-4 text-primary" />
                <span className="font-medium">Recording for:</span>
                <Badge className="bg-primary/20 text-primary">
                  {availableFields.find(f => f.id === targetField)?.label || targetField}
                </Badge>
              </div>
            </div>
          )}

          {(interimTranscript || finalTranscript) && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg border min-h-[80px]">
              <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
              <p className="text-base">
                <span>{finalTranscript}</span>
                <span className="text-muted-foreground italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {isListening ? (
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={stopListening}
                data-testid="button-stop-voice"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop & Submit
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="flex-1 bg-gradient-to-r from-primary to-purple-600" 
                onClick={startListening}
                disabled={status === "processing"}
                data-testid="button-start-voice"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            )}
            <Button variant="outline" onClick={cancelListening}>
              Cancel
            </Button>
          </div>

          <div className="border-t pt-4">
            <button
              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowCommands(!showCommands)}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Voice Commands
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showCommands && "rotate-180")} />
            </button>
            
            {showCommands && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_COMMANDS.slice(0, 8).map((cmd) => (
                    <div key={cmd.command} className="text-xs p-2 bg-muted/50 rounded">
                      <span className="font-mono text-primary">"{cmd.command}"</span>
                      <span className="text-muted-foreground ml-1">- {cmd.description}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Say a field name to target it, then speak your content. Say "stop" when done.
                </p>
              </div>
            )}
          </div>

          {availableFields.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium mb-2">Quick Target Fields:</p>
              <div className="flex flex-wrap gap-2">
                {availableFields.slice(0, 6).map((field) => {
                  const Icon = getCategoryIcon(field.category);
                  return (
                    <Badge
                      key={field.id}
                      variant={targetField === field.id ? "default" : "outline"}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setTargetField(field.id)}
                      data-testid={`badge-target-${field.id}`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {field.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface FloatingVoiceButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function FloatingVoiceButton({ onClick, isActive }: FloatingVoiceButtonProps) {
  return (
    <Button
      size="icon"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40 transition-all duration-300",
        isActive 
          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
          : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
      )}
      data-testid="button-floating-voice"
    >
      {isActive ? (
        <MicOff className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </Button>
  );
}
