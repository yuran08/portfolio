"use client";

import { cn } from "@/lib/utils";
import { getCookie, setCookie } from "@/lib/utils/cookies";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ModelToggle({
  isReasonerModel,
  setIsSearchMode,
  setIsReasonerModel,
}: {
  isReasonerModel: boolean | undefined;
  setIsSearchMode: ReturnType<typeof useState<boolean>>[1];
  setIsReasonerModel: ReturnType<typeof useState<boolean>>[1];
}) {
  useEffect(() => {
    const savedMode = getCookie("reasoner-model");
    if (savedMode !== null) {
      setIsReasonerModel(savedMode === "true");
    } else {
      setCookie("reasoner-model", "false");
    }
  }, [setIsReasonerModel]);

  const handleSearchModeChange = (pressed: boolean) => {
    if (pressed) {
      setIsSearchMode(!pressed);
      setCookie("search-mode", (!pressed).toString());
    }
    setIsReasonerModel(pressed);
    setCookie("reasoner-model", pressed.toString());
  };

  return (
    <Toggle
      aria-label="Toggle search mode"
      pressed={isReasonerModel}
      onPressedChange={handleSearchModeChange}
      variant="outline"
      className={cn(
        "gap-1 border border-input bg-background px-3 text-accent-foreground",
        "rounded-full hover:bg-accent hover:text-accent-foreground data-[state=on]:border-blue-300/50 data-[state=on]:bg-blue-600/20 data-[state=on]:text-blue-600 dark:data-[state=on]:border-blue-900 dark:data-[state=on]:bg-blue-950 dark:data-[state=on]:text-blue-300"
      )}
    >
      <Brain className="size-4" />
      <span className="text-xs">推理模型</span>
    </Toggle>
  );
}
