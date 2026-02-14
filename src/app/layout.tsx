import type { Metadata } from "next";
import { Inter, Outfit, Zen_Old_Mincho, Zen_Kurenaido, Dancing_Script } from "next/font/google";
import "./globals.css";
import ThemeWrapper from "@/components/ThemeWrapper";
import StartupOverlay from "@/components/StartupOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const zenOldMincho = Zen_Old_Mincho({
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-zen-old-mincho",
  preload: false,
});

const zenKurenaido = Zen_Kurenaido({
  weight: ["400"],
  variable: "--font-zen-kurenaido",
  preload: false,
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Re:Me",
  description: "A quiet device for reuniting with memories.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Re:Me",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${outfit.variable} ${zenOldMincho.variable} ${zenKurenaido.variable} ${dancingScript.variable} antialiased text-slate-900 bg-slate-50 font-serif`}
      >
        <ThemeWrapper>
          <StartupOverlay />
          {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
