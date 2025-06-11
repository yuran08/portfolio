"use client";

import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg transition-all dark:bg-slate-800 md:hidden"
      aria-label={isOpen ? "关闭菜单" : "打开菜单"}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-gray-700 dark:text-slate-200" />
      ) : (
        <Menu className="h-5 w-5 text-gray-700 dark:text-slate-200" />
      )}
    </button>
  );
} 