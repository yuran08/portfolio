"use client";

import { useTransition, unstable_ViewTransition as ViewTransition } from "react";
import Link from "next/link";

interface NavigationButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  href: string;
  onNavigation: () => void;
}

/**
 * 导航按钮组件
 * 使用 <Link> 实现预取和导航，同时支持 onClick 事件
 */
export function NavigationButton({
  children,
  disabled,
  className,
  href,
  onNavigation,
}: NavigationButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending || disabled) return;
    startTransition(() => {
      onNavigation();
    });
  };

  return (
    <ViewTransition name={href}>
      <Link
        href={href}
        onClick={handleClick}
        aria-disabled={isPending || disabled}
        className={`${className} ${isPending || disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        {isPending ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>加载中...</span>
          </div>
        ) : (
          children
        )}
      </Link>
    </ViewTransition>

  );
}
