"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { SceneCarousel, type SceneDefinition } from "./scene-carousel";

export function SceneRoot({ scenes }: { scenes: SceneDefinition[] }) {
  const pathname = usePathname();
  const instanceKeyRef = useRef<string>("");

  if (!instanceKeyRef.current) {
    instanceKeyRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  // As a belt-and-suspenders approach, when we detect we navigated back to scenes,
  // create a brand new instance key so the carousel fully remounts.
  useEffect(() => {
    if (pathname && /\/play\/scenes\/?$/.test(pathname)) {
      instanceKeyRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }, [pathname]);

  return <SceneCarousel key={instanceKeyRef.current} scenes={scenes} />;
}

