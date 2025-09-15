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
      {!open && (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="text-white" />
          </TooltipTrigger>
          <TooltipContent>打开边栏</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
