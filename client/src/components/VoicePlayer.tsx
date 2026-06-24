import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Pause, Loader2, Volume1, VolumeX } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VoicePlayerProps {
  text: string;
  language?: "en" | "hi" | "hinglish";
  disabled?: boolean;
  autoPlay?: boolean;
  showVolume?: boolean;
}

export default function VoicePlayer({
  text,
  language = "hinglish",
  disabled = false,
  autoPlay = false,
  showVolume = true,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeechMutation = trpc.voice.generateSpeech.useMutation();

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
  }, [autoPlay, text]);

  // Update audio volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

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
        audio.volume = volume / 100;
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

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 50) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
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

      {showVolume && (
        <div className="relative">
          <Button
            onClick={() => setShowVolumeControl(!showVolumeControl)}
            variant="ghost"
            size="sm"
            className="gap-1"
            title="Volume control"
          >
            {getVolumeIcon()}
            <span className="text-xs">{volume}%</span>
          </Button>

          {showVolumeControl && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg p-3 w-32 shadow-lg z-50">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Volume</label>
                <Slider
                  value={[volume]}
                  onValueChange={(val) => setVolume(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{volume}%</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
