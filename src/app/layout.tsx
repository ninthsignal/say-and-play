import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SpeechSettingsPanel } from "@/components/speech/speech-settings-panel";
import { SpeechSettingsProvider } from "@/components/speech/settings-context";
import { ReactDevtoolsSemverPatch } from "@/components/system/react-devtools-semver-patch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Say & Play",
  description: "Voice and gesture driven learning games for kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SpeechSettingsProvider>
          <ReactDevtoolsSemverPatch />
          {children}
          <SpeechSettingsPanel />
        </SpeechSettingsProvider>
      </body>
    </html>
  );
}
