import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "next-themes";
import { HighlightThemeSwitcher } from "./highlight-theme-switcher";
import { Suspense } from "react";
import SideBar from "./sidebar/side-bar";
import { SidebarSkeleton } from "./ui/skeleton";
import { headers } from "next/headers";
import { getConversationList } from "./action";

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
}

export default async function ChatPageLayout({ children }: ChatLayoutProps) {
  // 从middleware设置的headers获取conversationId
  const headersList = await headers();
  const currentConversationId =
    headersList.get("x-conversation-id") || undefined;
  const conversations = await getConversationList();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* KaTeX CSS - 数学公式渲染必需 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
          integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP"
          crossOrigin="anonymous"
        />
        {/* 移动端视口设置 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
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
          <HighlightThemeSwitcher />
          {/* 通过key强制重新渲染Sidebar */}
          <Suspense fallback={<SidebarSkeleton />}>
            <SideBar
              key={currentConversationId}
              currentConversationId={currentConversationId}
              conversations={conversations}
            />
          </Suspense>
          {/* 主内容区域 - 在移动端占满屏幕，在桌面端留出侧边栏空间 */}
          <main className="flex flex-1 flex-col bg-white dark:bg-slate-950 w-full md:w-auto">
            {children}
          </main>
        </body>
      </ThemeProvider>
    </html>
  );
}
