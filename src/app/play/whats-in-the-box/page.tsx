import Link from "next/link";
import { X } from "lucide-react";

import { GiftPlayground, GiftDefinition, VoicePromptConfig } from "@/components/whats-in-the-box/gift-playground";

const gifts: GiftDefinition[] = [
  {
    id: "red",
    title: "Red Ribbon",
    description: "Bright red box with a golden bow.",
    baseColor: "#f87171",
    ribbonColor: "#facc15",
    accentColor: "#fde68a",
    pattern: "solid",
    prizeColor: "#34d399",
    prizeLabel: "Robot Pal",
  },
  {
    id: "blue",
    title: "Blue Swirls",
    description: "Cool blue box with shiny stripes.",
    baseColor: "#60a5fa",
    ribbonColor: "#1d4ed8",
    accentColor: "#bfdbfe",
    pattern: "solid",
    prizeColor: "#f472b6",
    prizeLabel: "Magic Wand",
  },
  {
    id: "polka",
    title: "Polka Party",
    description: "Playful polka dot gift.",
    baseColor: "#fbcfe8",
    ribbonColor: "#ec4899",
    accentColor: "#f472b6",
    pattern: "polka",
    prizeColor: "#f59e0b",
    prizeLabel: "Toy Boat",
  },
  {
    id: "green",
    title: "Green Glow",
    description: "Lime green surprise box.",
    baseColor: "#4ade80",
    ribbonColor: "#059669",
    accentColor: "#86efac",
    pattern: "solid",
    prizeColor: "#60a5fa",
    prizeLabel: "Toy Rocket",
  },
];

const prompts: VoicePromptConfig[] = [
  {
    id: "red-box",
    label: "Can you open the red box?",
    audio: "/audio/phrases/open-red-box.mp3",
    phraseVariants: [
      "can you open the red box",
      "open the red box",
      "open red box",
      "open the box that is red",
    ],
    target: { type: "gift", giftId: "red" },
  },
  {
    id: "blue-box",
    label: "Can you open the blue box?",
    audio: "/audio/phrases/open-blue-box.mp3",
    phraseVariants: [
      "can you open the blue box",
      "open the blue box",
      "open blue box",
      "open the box that is blue",
    ],
    target: { type: "gift", giftId: "blue" },
  },
  {
    id: "first-box",
    label: "Can you open the first box?",
    audio: "/audio/phrases/open-first-box.mp3",
    phraseVariants: [
      "can you open the first box",
      "open the first box",
      "open first box",
      "open box number one",
    ],
    target: { type: "first" },
  },
  {
    id: "last-box",
    label: "Can you open the last box?",
    audio: "/audio/phrases/open-last-box.mp3",
    phraseVariants: [
      "can you open the last box",
      "open the last box",
      "open last box",
      "open the final box",
    ],
    target: { type: "last" },
  },
  {
    id: "polka-box",
    label: "Can you open the box with polka dots?",
    audio: "/audio/phrases/open-polka-box.mp3",
    phraseVariants: [
      "can you open the polka dot box",
      "can you open the box with polka dots",
      "open the polka dot box",
      "open the box with polka dots",
      "open polka dot box",
      "open polka dots box",
      "open the spotty box",
    ],
    target: { type: "gift", giftId: "polka" },
  },
  {
    id: "green-box",
    label: "Can you open the green box?",
    audio: "/audio/phrases/open-green-box.mp3",
    phraseVariants: [
      "can you open the green box",
      "open the green box",
      "open green box",
      "open the box that is green",
    ],
    target: { type: "gift", giftId: "green" },
  },
];

export default function WhatsInTheBoxPage() {
  return (
    <main className="relative min-h-screen bg-white px-4 py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12">
        <div className="flex w-full justify-end">
          <Link
            href="/play"
            aria-label="Close What's in the Box game"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] text-white shadow-md transition hover:brightness-105"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="relative flex w-full flex-col items-center gap-6 text-center">
          <div className="pointer-events-none absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-[conic-gradient(from_210deg,rgba(94,231,223,0.18),rgba(240,147,251,0.2),rgba(245,87,108,0.18),rgba(94,231,223,0.18))] blur-3xl" aria-hidden />
          <h1 className="relative z-10 text-4xl font-black text-purple-900 md:text-5xl">What&apos;s in the Box?</h1>
          <p className="relative z-10 max-w-2xl text-base text-slate-700 md:text-lg">
            Drag, spin, and speak to explore every surprise. Try ordering the gifts, rotating with two fingers, and saying the magic phrases.
          </p>
        </div>
        <GiftPlayground gifts={gifts} prompts={prompts} />
      </div>
    </main>
  );
}

