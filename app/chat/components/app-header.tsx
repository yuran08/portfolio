"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AppHeader() {
  const { open } = useSidebar();
  return (
    <div className="absolute top-4 left-4 z-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="dark:text-white" />
        </TooltipTrigger>
        <TooltipContent>{open ? "收起边栏" : "打开边栏"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
