"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface NavigationButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  conversationId?: string;
  onNavigation: () => void;
}

/**
 * 导航按钮组件
 * 使用Server Action进行导航并清除缓存
 */
export function NavigationButton({
  children,
  disabled,
  className,
  conversationId,
  onNavigation,
}: NavigationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      onNavigation();
      if (conversationId) {
        router.push(`/chat/conversation/${conversationId}`);
      } else {
        router.push("/chat");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending || disabled}
      className={`${className} ${isPending || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      {isPending ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
