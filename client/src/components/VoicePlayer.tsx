import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VoicePlayerProps {
  text: string;
  language?: "en" | "hi" | "hinglish";
  disabled?: boolean;
  autoPlay?: boolean;
}

export default function VoicePlayer({
  text,
  language = "hinglish",
  disabled = false,
  autoPlay = false,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeechMutation = trpc.voice.generateSpeech.useMutation();

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
  }, [autoPlay, text]);

  const playAudio = async () => {
    if (!text) return;

    try {
      setIsLoading(true);

      // Generate speech
      const result = await generateSpeechMutation.mutateAsync({
        text,
        language,
      });

      if (result.audioUrl) {
        // Create and play audio
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          alert("Failed to play audio");
        };

        audio.play();
      }
    } catch (error) {
      console.error("Speech generation failed:", error);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={disabled || !text || isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
      title={isPlaying ? "Pause" : "Play audio"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {isLoading ? "Loading..." : isPlaying ? "Pause" : "Listen"}
    </Button>
  );
}
