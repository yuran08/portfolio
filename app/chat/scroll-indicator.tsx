"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollIndicator({ isVisible, onClick }: ScrollIndicatorProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
    } else {
      // 延迟隐藏，避免闪烁
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClick = () => {
    setIsClicked(true);
    onClick();

    // 重置点击状态
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <button
        onClick={handleClick}
        className={`flex items-center justify-center rounded-full p-3 text-white shadow-lg transition-all duration-200 hover:scale-105 ${
          isClicked
            ? "bg-blue-800 dark:bg-indigo-800"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        }`}
        aria-label="滚动到底部"
        type="button"
      >
        <ChevronDown
          className={`h-5 w-5 ${isClicked ? "" : "animate-bounce"}`}
        />
      </button>
    </div>
  );
}
