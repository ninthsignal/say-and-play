"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSpeechSettings } from "./settings-context";

const toleranceDescriptions = [
  "Exact match only",
  "Small mispronunciations allowed",
  "Moderate flexibility",
  "Very relaxed matching",
];

export function SpeechSettingsPanel() {
  const { tolerance, setTolerance } = useSpeechSettings();
  const [isOpen, setIsOpen] = useState(false);

  const description = toleranceDescriptions[tolerance] ?? "Custom sensitivity";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 text-white">
      {isOpen ? (
        <div className="w-72 rounded-2xl bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] p-[2px] shadow-xl">
          <div className="rounded-[20px] bg-black/35 p-4 backdrop-blur">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Speech match strictness</p>
                <p className="text-xs text-white/80">Adjust how closely phrases must match the prompts.</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/15"
                onClick={() => setIsOpen(false)}
                aria-label="Close speech settings"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Slider
              max={3}
              min={0}
              step={1}
              value={[tolerance]}
              onValueChange={([value]) => setTolerance(Math.round(value))}
              aria-label="Speech tolerance"
              className="mt-2"
            />
            <p className="mt-3 text-xs font-medium text-white">{description}</p>
          </div>
        </div>
      ) : null}
      <Button
        size="sm"
        variant="secondary"
        className="shadow-md bg-[linear-gradient(135deg,_#f093fb_0%,_#f5576c_100%)] text-white hover:opacity-90"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Speech Settings
      </Button>
    </div>
  );
}
