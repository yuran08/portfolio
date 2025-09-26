// "use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ChatHistorySection } from "./sidebar/chat-history-section";
import { ChatHistorySkeleton } from "./sidebar/chat-history-skeleton";

export default function AppSidebar() {
  return (
    <Sidebar side="left" variant="inset" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row items-center justify-between">
        <Link
          href="/chat"
          className="justify-betwee flex items-center gap-2 px-2 py-3"
        >
          <span className="text-sm font-semibold">Chat Box</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="dark:text-white" />
          </TooltipTrigger>
          <TooltipContent>收起边栏</TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <SidebarContent className="flex h-full flex-col px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/chat" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>新的对话</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<ChatHistorySkeleton />}>
            <ChatHistorySection />
          </Suspense>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
