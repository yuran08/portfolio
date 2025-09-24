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
    <div className="absolute top-6 left-4 z-10 max-sm:top-2 max-sm:left-2">
      {!open && (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="dark:text-white" />
          </TooltipTrigger>
          <TooltipContent>打开边栏</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
