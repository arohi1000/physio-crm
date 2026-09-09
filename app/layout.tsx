import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MockApiProvider } from "@/components/MockApiProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Physio CRM",
  description: "Clinic administration for the physiotherapy practice.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <MockApiProvider>{children}</MockApiProvider>
      </body>
    </html>
  );
}
