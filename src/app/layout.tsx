import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Oswald } from "next/font/google";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { LOCALE_BOOT_SCRIPT } from "@/lib/locale-boot";
import "./globals.css";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

const body = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SETS / 计组",
  description: "A gym-floor set counter. Log the lift, the reps, the rest.",
  applicationName: "SETS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SETS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#12110F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <AnalyticsBeacon />
      </body>
    </html>
  );
}
