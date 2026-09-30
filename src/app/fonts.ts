import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Self-hosted at build time by next/font (no runtime requests to Google, no layout shift).
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Editorial display face — used only for large headlines on marketing pages.
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
