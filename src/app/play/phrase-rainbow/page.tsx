import Link from "next/link";
import { X } from "lucide-react";

import { SceneRoot } from "@/components/scenes/scene-root";
import type { SceneDefinition } from "@/components/scenes/scene-carousel";

const scenes: SceneDefinition[] = [
  {
    id: 1,
    variant: "juice",
    prompt: "Can I have more juice?",
    audio: "/audio/phrases/can-i-have-more-juice.mp3",
    phraseVariants: [
      "can i have more juice",
      "can i get more juice",
      "may i have more juice",
      "may i get more juice",
      "need more juice",
      "more juice please",
      "i want more juice",
      "more juice",
    ],
    accentColor: "#f97316",
    beforeLevel: 0.4,
    afterLevel: 0.9,
    background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
  },
  {
    id: 2,
    variant: "hungry",
    prompt: "I'm hungry.",
    audio: "/audio/phrases/im-hungry.mp3",
    phraseVariants: [
      "i'm hungry",
      "im hungry",
      "i am hungry",
      "i feel hungry",
      "can i have some food",
      "may i have a snack",
      "i need food",
    ],
    accentColor: "#fbbf24",
    cupColor: "#38bdf8",
    plateColor: "#fde68a",
    background: "linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)",
  },
  {
    id: 3,
    variant: "thirsty",
    prompt: "I'm thirsty.",
    audio: "/audio/phrases/im-thirsty.mp3",
    phraseVariants: [
      "i'm thirsty",
      "im thirsty",
      "i am thirsty",
      "i feel thirsty",
      "can i have some water",
      "may i have a drink",
      "i need water",
    ],
    accentColor: "#38bdf8",
    cupColor: "#0ea5e9",
    plateColor: "#dbeafe",
    background: "linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)",
  },
];

export default function PhraseRainbowPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <Link
        href="/play"
        aria-label="Close Phrase Rainbow game"
        className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] text-white shadow-md transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="h-5 w-5" />
      </Link>
      <div className="flex-1">
        <SceneRoot scenes={scenes} />
      </div>
    </main>
  );
}
