import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SideBar from "./side-bar";
import "@/app/globals.css";
import { getConversationList } from "./action";
import { Suspense } from "react";
import { ConversationProvider } from "./conversation-context";
import { ThemeProvider } from "next-themes";

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
  const conversations = await getConversationList();
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
          className={`${geistSans.variable} ${geistMono.variable} flex h-screen bg-white dark:bg-slate-950 text-black dark:text-slate-100 antialiased`}
        >
          <ConversationProvider initialConversations={conversations}>
            <Suspense fallback={<div>Loading...</div>}>
              <SideBar />
            </Suspense>

            <main className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950">
              {children}
            </main>
          </ConversationProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}