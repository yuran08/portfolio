"use client";

import { cn } from "@/lib/utils";
import { getCookie, setCookie } from "@/lib/utils/cookies";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ModelToggle() {
  const [isReasonerModel, setIsReasonerModel] = useState(false);

  useEffect(() => {
    const savedMode = getCookie("reasoner-model");
    if (savedMode !== null) {
      setIsReasonerModel(savedMode === "true");
    } else {
      setCookie("reasoner-model", "false");
    }
  }, []);

  const handleSearchModeChange = (pressed: boolean) => {
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
        "gap-1 border border-input bg-background px-3 text-muted-foreground",
        "rounded-full hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Globe className="size-4" />
      <span className="text-xs">推理模型</span>
    </Toggle>
  );
}
