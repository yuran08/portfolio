"use client";

import { cn } from "@/lib/utils";
import { getCookie, setCookie } from "@/lib/utils/cookies";
import { Globe } from "lucide-react";
import { useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";

export function SearchModeToggle({
  isSearchMode,
  setIsSearchMode,
  setIsReasonerModel,
}: {
  isSearchMode: boolean;
  setIsSearchMode: Function;
  setIsReasonerModel: Function;
}) {
  useEffect(() => {
    const savedMode = getCookie("search-mode");
    if (savedMode !== null) {
      setIsSearchMode(savedMode === "true");
    } else {
      setCookie("search-mode", "false");
    }
  }, []);

  const handleSearchModeChange = (pressed: boolean) => {
    if (pressed) {
      setIsReasonerModel(!pressed);
      setCookie("reasoner-model", (!pressed).toString());
    }
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
        "gap-1 border border-input bg-background px-3 text-accent-foreground",
        "rounded-full hover:bg-accent hover:text-accent-foreground data-[state=on]:border-blue-300/50 data-[state=on]:bg-blue-600/20 data-[state=on]:text-blue-600 dark:data-[state=on]:border-blue-900 dark:data-[state=on]:bg-blue-950 dark:data-[state=on]:text-blue-300"
      )}
    >
      <Globe className="size-4" />
      <span className="text-xs">联网搜索</span>
    </Toggle>
  );
}
