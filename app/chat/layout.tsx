import type { Metadata } from "next";
import "@/app/(root)/globals.css";
import { ThemeProvider } from "next-themes";
import AppSidebar from "./components/app-sidebar";
import AppHeader from "./components/app-header";

import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "𝓎𝓇 𝒸𝒽𝒶𝓉",
  description: "Client-first AI chat app",
};
interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatPageLayout({ children }: ChatLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="chat-theme" // 使用不同的存储键，避免与 home 冲突
    >
      <div className="flex h-screen text-black antialiased">
        {/* <HighlightThemeSwitcher /> */}
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <main className="relative flex w-full flex-1 flex-col bg-background md:w-auto">
            <AppHeader />
            {children}
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}
