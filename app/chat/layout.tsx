import type { Metadata } from "next";
import "@/app/(root)/globals.css";
import { ThemeProvider } from "next-themes";
import { HighlightThemeSwitcher } from "./highlight-theme-switcher";
import { headers } from "next/headers";
import AppSidebar from "./components/app-sidebar";
import AppHeader from "./components/app-header";

import { SidebarProvider } from "@/components/ui/sidebar";

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
  // const { open } = useSidebar();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="chat-theme" // 使用不同的存储键，避免与 home 冲突
    >
      <div className="flex h-screen bg-white text-black antialiased dark:bg-slate-950 dark:text-slate-100">
        <HighlightThemeSwitcher />
        <SidebarProvider defaultOpen>
          {/* <TooltipProvider> */}
          <AppSidebar />
          {/* 主内容区域 - 在移动端占满屏幕，在桌面端留出侧边栏空间 */}
          <main className="relative flex w-full flex-1 flex-col bg-white md:w-auto dark:bg-slate-950">
            <AppHeader />
            {children}
          </main>
          {/* </TooltipProvider> */}
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}
