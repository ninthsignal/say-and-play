"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AudioPromptButtonProps = {
  label: string;
  src: string;
  className?: string;
};

export function AudioPromptButton({ label, src, className }: AudioPromptButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio(src);

    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError("Could not play audio clip");
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const handlePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      setError(null);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setError("Playback blocked. Try interacting with the page first.");
    }
  };

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <Button
        size="lg"
        onClick={handlePlay}
        className="h-12 gap-3 rounded-full bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] px-6 text-base font-semibold text-white shadow-md transition hover:brightness-110"
      >
        {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        <span className="text-left">{label}</span>
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
