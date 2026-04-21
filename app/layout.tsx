import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { AIChatGate } from "@/components/ai/AIChatGate";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AutismConnect — all autism resources in one place",
  description:
    "A warm, parent-led home for autism resources, community, and AI-powered guidance. Launching in Georgia.",
  openGraph: {
    title: "AutismConnect",
    description:
      "All autism resources in one place. Community, resources, and AI guidance for parents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="font-sans bg-cream text-plum-800 overflow-x-hidden">
        {children}
        <AIChatGate />
      </body>
    </html>
  );
}
