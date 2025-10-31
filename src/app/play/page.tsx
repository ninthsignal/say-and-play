import Link from "next/link";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";

const games = [
  {
    href: "/play/whats-in-the-box",
    title: "What's in the Box?",
    description: "Use your voice to reveal and reorder a set of animated presents.",
    accent: "from-[#fdf2f8] via-[#f5f3ff] to-transparent",
  },
  {
    href: "/play/phrase-rainbow",
    title: "Phrase Rainbow",
    description: "Say everyday phrases to paint the scene with new colors.",
    accent: "from-[#e0f2fe] via-[#c4b5fd] to-transparent",
  },
];

export default function PlayPage() {
  return (
    <main className="relative min-h-screen bg-white px-4 pb-24 pt-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Go to home"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] text-white shadow-md transition hover:brightness-105"
          >
            <Home className="h-5 w-5" />
          </Link>
          <span className="h-11 w-11" aria-hidden />
        </div>
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-black text-purple-900 md:text-5xl">Pick a Game</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-700 md:text-lg">
            Each game practices listening, speaking, and playful problem solving using voice and touch.
          </p>
        </header>
        <div className="relative">
          <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg,rgba(240,147,251,0.2),rgba(245,87,108,0.15),rgba(94,231,223,0.2),rgba(240,147,251,0.2))] blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-24 top-1/4 h-56 w-56 rounded-full bg-[conic-gradient(from_90deg,rgba(94,231,223,0.2),rgba(180,144,202,0.18),rgba(240,147,251,0.2))] blur-3xl" aria-hidden />
          <section className="relative grid gap-8 md:grid-cols-2">
            {games.map((game, index) => (
              <Link
                key={game.href}
                href={game.href}
                className="group"
                style={{ animationDelay: index * 120 + "ms" }}
              >
                <article
                  className={cn(
                    "relative flex h-full transform flex-col gap-5 overflow-hidden rounded-2xl border border-white bg-white p-8 text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300",
                    "animate-fade-up group-hover:scale-[1.03] group-hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-80 blur-3xl",
                      "bg-gradient-to-br " + game.accent,
                    )}
                    aria-hidden
                  />
                  <div className="relative z-10 flex flex-col gap-5">
                    <h2 className="text-2xl font-bold text-purple-900">{game.title}</h2>
                    <p className="text-sm text-slate-700 md:text-base">{game.description}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110">
                      Start playing &gt;
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

