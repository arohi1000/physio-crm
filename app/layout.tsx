import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { MockApiProvider } from "@/components/MockApiProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Physio CRM",
  description: "Clinic administration for the physiotherapy practice.",
  robots: { index: false, follow: false },
};

// Typed explicitly rather than with Next's generated `LayoutProps`: that global
// only exists once `.next/types` has been written by a build, so CI — which
// typechecks before building — cannot see it.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {/* Mocking starts first when it is on, so the session's silent refresh
            on load is intercepted rather than racing the worker. */}
        <MockApiProvider>
          <SessionProvider>{children}</SessionProvider>
        </MockApiProvider>
      </body>
    </html>
  );
}
