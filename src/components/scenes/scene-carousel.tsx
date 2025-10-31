"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SpringValue, animated, config, to, useSpring, useTransition } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { usePathname } from "next/navigation";

import { AudioPromptButton } from "@/components/audio/audio-prompt-button";
import { useSpeechSettings } from "@/components/speech/settings-context";
import { phrasesMatch } from "@/lib/speech";

declare global {
  interface WindowEventMap {
    "phrase-rainbow:complete": CustomEvent<{ sceneId?: number }>;
  }
}

type BaseScene = {
  id: number;
  prompt: string;
  audio: string;
  phraseVariants: string[];
  accentColor: string;
  background: string;
};

type JuiceScene = BaseScene & {
  variant: "juice";
  beforeLevel: number;
  afterLevel: number;
};

type PlateCupScene = BaseScene & {
  variant: "hungry" | "thirsty";
  cupColor: string;
  plateColor: string;
};

export type SceneDefinition = JuiceScene | PlateCupScene;

type SceneCarouselProps = {
  scenes: SceneDefinition[];
};

function JuiceGlass({
  level,
  color,
}: {
  level: SpringValue<number>;
  color: string;
}) {
  const ids = useId();
  const gradientId = `${ids}-gradient`;
  const clipPathId = `${ids}-clip`;

  return (
    <svg viewBox="0 0 120 160" className="h-44 w-28 text-sky-900" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>
        <clipPath id={clipPathId}>
          <path d="M40 26 H80 L74 126 Q72 134 64 136 H56 Q48 134 46 126 Z" />
        </clipPath>
      </defs>
      <path
        d="M30 10 h60 l-10 120 a10 10 0 0 1 -10 9 h-20 a10 10 0 0 1 -10 -9 z"
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="4"
      />
      <g clipPath={`url(#${clipPathId})`}>
        <animated.rect
          x={34}
          width={52}
          rx={10}
          fill={color}
          y={level.to((value) => 136 - value * 110)}
          height={level.to((value) => Math.max(0, value * 110))}
        />
      </g>
      <path
        d="M40 26 h40"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function JuiceSceneSlide({ scene, isComplete }: { scene: JuiceScene; isComplete: boolean }) {
  const glassSpring = useSpring({
    level: isComplete ? scene.afterLevel : scene.beforeLevel,
    config: config.gentle,
  });

  const beforeStyles = useSpring({
    opacity: isComplete ? 0 : 1,
    scale: isComplete ? 0.85 : 1,
    config: config.gentle,
  });

  const afterStyles = useSpring({
    opacity: isComplete ? 1 : 0,
    scale: isComplete ? 1 : 0.9,
    config: config.gentle,
  });

  return (
    <div className="relative h-60 w-60 max-w-full">
      <animated.div
        className="absolute inset-0 flex items-center justify-center"
        style={beforeStyles}
      >
        <JuiceGlass level={glassSpring.level} color={scene.accentColor} />
      </animated.div>
      <animated.div
        className="absolute inset-0 flex items-center justify-center"
        style={afterStyles}
      >
        <JuiceGlass level={glassSpring.level} color={scene.accentColor} />
      </animated.div>
    </div>
  );
}

function PlateGraphic({ plateColor }: { plateColor: string }) {
  const ids = useId();
  const gradientId = `${ids}-plate-gradient`;

  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48" aria-hidden>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="65%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor={plateColor} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="88" fill={plateColor} opacity="0.4" />
      <ellipse cx="100" cy="116" rx="72" ry="22" fill="rgba(0,0,0,0.05)" />
      <circle cx="100" cy="100" r="75" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
      <circle cx="100" cy="100" r="40" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
    </svg>
  );
}

function CupIllustration({ color }: { color: string }) {
  const liquidSpring = useSpring({ level: 0.6, config: config.gentle });
  return <JuiceGlass level={liquidSpring.level} color={color} />;
}

function PlateCupSceneSlide({ scene, isComplete }: { scene: PlateCupScene; isComplete: boolean }) {
  const plateSpring = useSpring({
    translateX: scene.variant === "hungry" ? (isComplete ? 0 : -100) : -100,
    scale: scene.variant === "thirsty" && isComplete ? 0.85 : 1,
    opacity: scene.variant === "thirsty" && isComplete ? 0 : 1,
    config: config.gentle,
  });

  const cupSpring = useSpring({
    translateX:
      scene.variant === "hungry"
        ? isComplete
          ? 240
          : 100
        : scene.variant === "thirsty"
          ? isComplete
            ? 0
            : 100
          : 0,
    scale: scene.variant === "hungry" && isComplete ? 0.9 : 1,
    opacity: scene.variant === "hungry" && isComplete ? 0 : 1,
    config: config.gentle,
  });

  return (
    <div className="relative h-60 w-60 max-w-full">
      <animated.div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{
          transform: to(
            [plateSpring.translateX, plateSpring.scale],
            (x, scale) => `translate3d(${x}px,0,0) scale(${scale})`,
          ),
          opacity: plateSpring.opacity,
        }}
      >
        <PlateGraphic plateColor={scene.plateColor} />
      </animated.div>
      <animated.div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{
          transform: to(
            [cupSpring.translateX, cupSpring.scale],
            (x, scale) => `translate3d(${x}px,0,0) scale(${scale})`,
          ),
          opacity: cupSpring.opacity,
        }}
      >
        <CupIllustration color={scene.cupColor} />
      </animated.div>
    </div>
  );
}

function SceneSlide({ scene, isComplete }: { scene: SceneDefinition; isComplete: boolean }) {
  const state = isComplete ? "complete" : "incomplete";

  return (
    <div className="flex flex-col items-center gap-8 text-center" data-testid="scene-slide" data-scene-state={state}>
      {scene.variant === "juice" ? (
        <JuiceSceneSlide scene={scene} isComplete={isComplete} />
      ) : (
        <PlateCupSceneSlide scene={scene} isComplete={isComplete} />
      )}
      <AudioPromptButton
        label={`Say: ${scene.prompt}`}
        src={scene.audio}
        className="items-center text-center"
      />
    </div>
  );
}

export function SceneCarousel({ scenes }: SceneCarouselProps) {
  const sceneCount = scenes.length;
  const { tolerance } = useSpeechSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const pathname = usePathname();
  const lastTranscriptRef = useRef<string>("");
  const ignoreTranscriptRef = useRef(false);

  const {
    transcript,
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

  const microphoneWarning = browserSupportsSpeechRecognition && !isMicrophoneAvailable;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;

    SpeechRecognition.startListening(listeningOptions).catch(() => {});

    return () => {
      SpeechRecognition.stopListening().catch(() => {});
    };
  }, [browserSupportsSpeechRecognition, listeningOptions]);

  useEffect(() => {
    if (pathname && /\/play\/phrase-rainbow\/?$/.test(pathname)) {
      setActiveIndex(0);
      setDirection(1);
      setCompleted({});
      lastTranscriptRef.current = "";
      ignoreTranscriptRef.current = true;
      resetTranscript();
    }
  }, [pathname, resetTranscript]);

  useEffect(() => {
    if (!sceneCount) {
      setActiveIndex(0);
      setCompleted({});
      lastTranscriptRef.current = "";
      ignoreTranscriptRef.current = false;
      return;
    }
    setActiveIndex((prev) => Math.min(prev, sceneCount - 1));
  }, [sceneCount]);

  useEffect(() => {
    const handleComplete = (event: WindowEventMap["phrase-rainbow:complete"]) => {
      const targetSceneId = event.detail?.sceneId ?? scenes[activeIndex]?.id;
      if (typeof targetSceneId !== "number") {
        return;
      }
      setCompleted((prev) => ({ ...prev, [targetSceneId]: true }));
    };

    window.addEventListener("phrase-rainbow:complete", handleComplete);
    return () => {
      window.removeEventListener("phrase-rainbow:complete", handleComplete);
    };
  }, [activeIndex, scenes]);

  const transitions = useTransition(activeIndex, {
    keys: (index) => scenes[index]?.id ?? index,
    from: {
      opacity: 0,
      transform: `translate3d(${direction === 1 ? "100%" : "-100%"},0,0)`,
    },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    leave: {
      opacity: 0,
      transform: `translate3d(${direction === 1 ? "-40%" : "40%"},0,0)`,
    },
    initial: { opacity: 1, transform: "translate3d(0%,0,0)" },
    config: config.stiff,
  });

  const activeScene = sceneCount ? scenes[activeIndex] ?? null : null;

  useEffect(() => {
    if (!activeScene) return;

    const normalized = transcript.trim().toLowerCase();
    if (ignoreTranscriptRef.current) {
      if (!normalized) {
        ignoreTranscriptRef.current = false;
        lastTranscriptRef.current = "";
      }
      return;
    }

    if (!normalized) {
      lastTranscriptRef.current = "";
      return;
    }

    if (normalized === lastTranscriptRef.current) {
      return;
    }

    if (phrasesMatch(normalized, activeScene.phraseVariants, tolerance)) {
      setCompleted((prev) => ({ ...prev, [activeScene.id]: true }));
      lastTranscriptRef.current = normalized;
      ignoreTranscriptRef.current = true;
      resetTranscript();
      return;
    }

    lastTranscriptRef.current = normalized;
  }, [activeScene, resetTranscript, tolerance, transcript]);

  const bind = useDrag(
    ({ last, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!sceneCount) {
        return;
      }

      if (last) {
        const hasIntent = Math.abs(mx) > 60 || vx > 0.35;
        if (hasIntent) {
          const nextDirection: 1 | -1 = mx < 0 || dx < 0 ? 1 : -1;
          setDirection(nextDirection);
          setActiveIndex((prev) => {
            const next = (prev + nextDirection + sceneCount) % sceneCount;
            const sceneLeaving = scenes[prev];
            if (sceneLeaving) {
              setCompleted((completedState) => {
                if (!completedState[sceneLeaving.id]) {
                  return completedState;
                }
                const nextCompleted = { ...completedState };
                delete nextCompleted[sceneLeaving.id];
                return nextCompleted;
              });
            }
            return next;
          });
        }
      }
    },
    { axis: "x", filterTaps: true },
  );

  if (!activeScene) {
    return null;
  }

  return (
    <div
      className="relative flex h-screen w-full touch-pan-y"
      aria-live="polite"
      {...bind()}
    >
      {microphoneWarning ? (
        <div className="pointer-events-none absolute left-1/2 top-8 z-20 w-[min(90%,320px)] -translate-x-1/2 rounded-full bg-black/60 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg">
          Turn on your microphone to practice the scene.
        </div>
      ) : null}
      {/* Fallback background to avoid black flash if animation is delayed */}
      {activeScene ? (
        <div
          className="absolute inset-0"
          style={{ background: activeScene.background }}
          aria-hidden
        />
      ) : null}

      {transitions((style, index) => {
        const scene = scenes[index] ?? activeScene;
        if (!scene) {
          return null;
        }
        return (
          <animated.div
            key={scene.id}
            style={{ ...style, background: scene.background }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 py-12 text-white will-change-transform"
          >
            <SceneSlide scene={scene} isComplete={Boolean(completed[scene.id])} />
          </animated.div>
        );
      })}

      {/* Absolute safety net: render static content when no transition frames */}
      {!transitions || !sceneCount ? null : null}
    </div>
  );
}
