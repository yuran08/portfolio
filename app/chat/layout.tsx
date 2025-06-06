import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "next-themes";
import { HighlightPreloader } from "./highlight-preloader";
import { Suspense } from "react";
import SideBar from "./side-bar";
import { SidebarSkeleton } from "./skeleton";

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

// 定义layout的props类型
interface ChatLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id?: string }>;
}

export default async function ChatPageLayout({
  children,
  params,
}: ChatLayoutProps) {
  // 解析params以获取conversationId
  const resolvedParams = await params;
  const currentConversationId = resolvedParams?.id;

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
          {/* 将 Sidebar 移到 layout 中，在服务端直接传递 conversationId */}
          <Suspense fallback={<SidebarSkeleton />}>
            <SideBar currentConversationId={currentConversationId} />
          </Suspense>
          {/* 主内容区域 */}
          <main className="flex flex-1 flex-col bg-white dark:bg-slate-950">
            {children}
          </main>
        </body>
      </ThemeProvider>
    </html>
  );
}
