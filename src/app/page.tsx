"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSpeechSettings } from "@/components/speech/settings-context";
import { phrasesMatch } from "@/lib/speech";

const PASS_PHRASES = ["open sesame", "open seseme"];

export default function LandingPage() {
  const router = useRouter();
  const { tolerance } = useSpeechSettings();
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasPassed, setHasPassed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
    resetTranscript,
  } = useSpeechRecognition();

  const listeningOptions = useMemo(
    () => ({
      language: "en-US",
      ...(browserSupportsContinuousListening ? { continuous: true } : {}),
    }),
    [browserSupportsContinuousListening],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/audio/phrases/open-seseme.mp3");
    const audio = audioRef.current;

    if (!audio) return undefined;

    const handleEnded = () => setAudioError(null);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!isClient || !browserSupportsSpeechRecognition || hasPassed) {
      return;
    }

    SpeechRecognition.startListening(listeningOptions).catch(() => {
      // Permission errors are surfaced through the UI state.
    });

    return () => {
      SpeechRecognition.stopListening().catch(() => {
        /* silent */
      });
    };
  }, [browserSupportsSpeechRecognition, hasPassed, isClient, listeningOptions]);

  useEffect(() => {
    if (!transcript) return;

    if (phrasesMatch(transcript, PASS_PHRASES, tolerance) && !hasPassed) {
      setHasPassed(true);
      SpeechRecognition.stopListening();
    }

    return undefined;
  }, [hasPassed, tolerance, transcript]);

  useEffect(() => {
    if (!hasPassed) return undefined;

    const timeout = setTimeout(() => {
      router.push("/play");
    }, 600);

    return () => clearTimeout(timeout);
  }, [hasPassed, router]);

  const supportsSpeech = isClient && browserSupportsSpeechRecognition && isMicrophoneAvailable;

  const statusLabel = useMemo(() => {
    if (!isClient) {
      return "Getting the microphone ready...";
    }

    if (!browserSupportsSpeechRecognition) {
      return "Speech recognition is not supported in this browser.";
    }
    if (!isMicrophoneAvailable) {
      return "We can't reach the microphone. Check your browser settings.";
    }

    if (hasPassed) {
      return "Great job! Heading inside...";
    }

    if (listening) {
      return "Listening - say \"Open Seseme\"";
    }

    return "Tap the microphone to try again.";
  }, [browserSupportsSpeechRecognition, hasPassed, isClient, isMicrophoneAvailable, listening]);

  const handleLogoClick = async () => {
    try {
      setAudioError(null);
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setAudioError("Could not play the prompt. Make sure audio is allowed.");
    }
  };

  const handleRetry = async () => {
    setHasPassed(false);
    resetTranscript();
    try {
      await SpeechRecognition.startListening(listeningOptions);
    } catch {
      // Permission errors are surfaced through UI status.
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-12 text-slate-900">
      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center">
        <button
          type="button"
          onClick={handleLogoClick}
          className="group relative flex h-48 w-48 items-center justify-center rounded-full text-white"
          aria-label="Play the Open Seseme prompt"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,_#5ee7df_0%,_#b490ca_100%)]" />
          <span className="pointer-events-none absolute inset-0 rounded-full blur-3xl opacity-60" style={{ background: "conic-gradient(from 180deg, rgba(94,231,223,0.35), rgba(180,144,202,0.35), rgba(255,182,193,0.25), rgba(94,231,223,0.35))" }} />
          <span className="relative z-10 text-4xl font-black drop-shadow-md">
            Say &amp; Play
          </span>
        </button>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-purple-900 md:text-4xl">Open Seseme</h1>
          <p className="text-base text-slate-800 md:text-lg">
            Say the magic words to open the doors to adventure.
          </p>
          {audioError ? <p className="text-sm text-rose-700">{audioError}</p> : null}
        </div>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            {supportsSpeech ? (
              listening ? (
                <Loader2 className="h-5 w-5 animate-spin text-purple-700" />
              ) : (
                <Mic className="h-5 w-5 text-purple-700" />
              )
            ) : (
              <MicOff className="h-5 w-5 text-purple-700" />
            )}
            <span>{statusLabel}</span>
          </div>
          {transcript ? (
            <p className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-900 shadow-inner">
              {transcript}
            </p>
          ) : (
            <p className="text-sm text-slate-700">We will show what we hear right here.</p>
          )}
          {!listening && supportsSpeech && !hasPassed ? (
            <Button onClick={handleRetry} variant="default" className="gap-2 bg-purple-700 text-white hover:bg-purple-600">
              <Mic className="h-4 w-4" />
              Try again
            </Button>
          ) : null}
          {isClient && !browserSupportsSpeechRecognition ? (
            <p className="text-sm text-rose-700">
              Try using the latest version of Chrome, Edge, or Safari on desktop.
            </p>
          ) : null}
          {isClient && browserSupportsSpeechRecognition && !isMicrophoneAvailable ? (
            <p className="text-sm text-rose-700">
              Allow microphone access so we can hear the magic words.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

