import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VoiceRecorderProps {
  onTranscribed: (text: string) => void;
  language?: "en" | "hi" | "hinglish";
  placeholder?: string;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onTranscribed,
  language = "hinglish",
  placeholder = "Click to speak...",
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribeMutation = trpc.voice.transcribeAudioFile.useMutation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Call transcription API
        const result = await transcribeMutation.mutateAsync({
          audioUrl: base64Audio,
          language,
        });

        if (result.text) {
          onTranscribed(result.text);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Transcription failed:", error);
      alert("Failed to transcribe audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          disabled={disabled || isProcessing}
          variant="outline"
          size="sm"
          className="gap-2"
          title={placeholder}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isProcessing ? "Processing..." : "Speak"}
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="gap-2 animate-pulse"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-1 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <span className="text-xs text-red-600 font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
}
