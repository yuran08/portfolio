import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "next-themes";
import { HighlightPreloader } from "./highlight-preloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "𝓎𝓇 𝒸𝒽𝒶𝓉",
  description: "Server-driven AI chat app",
};

export default async function ChatPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 为 Chat 添加 ThemeProvider，默认系统主题，无切换功能 */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="chat-theme" // 使用不同的存储键，避免与 home 冲突
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex h-screen bg-white text-black antialiased dark:bg-slate-950 dark:text-slate-100`}
        >
          <HighlightPreloader />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
