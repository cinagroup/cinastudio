import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CinaSeek",
  description: "CinaSeek Web Application",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-slate-950 ${inter.className}`}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
