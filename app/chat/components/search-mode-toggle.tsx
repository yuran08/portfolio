"use client";

import { cn } from "@/lib/utils";
import { getCookie, setCookie } from "@/lib/utils/cookies";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function SearchModeToggle() {
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    const savedMode = getCookie("search-mode");
    if (savedMode !== null) {
      setIsSearchMode(savedMode === "true");
    } else {
      setCookie("search-mode", "false");
    }
  }, []);

  const handleSearchModeChange = (pressed: boolean) => {
    setIsSearchMode(pressed);
    setCookie("search-mode", pressed.toString());
  };

  return (
    <Toggle
      aria-label="Toggle search mode"
      pressed={isSearchMode}
      onPressedChange={handleSearchModeChange}
      variant="outline"
      className={cn(
        "gap-1 border border-input bg-background px-3 text-muted-foreground",
        // "data-[state=on]:bg-accent-blue",
        // "data-[state=on]:text-accent-blue-foreground",
        // "data-[state=on]:border-accent-blue-border",
        "rounded-full hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Globe className="size-4" />
      <span className="text-xs">联网搜索</span>
    </Toggle>
  );
}
