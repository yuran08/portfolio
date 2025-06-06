"use client";

import { navigateToConversation, navigateToChat } from "./navigation-action";
import { useTransition } from "react";

interface NavigationButtonProps {
  children: React.ReactNode;
  className?: string;
  conversationId?: string;
}

/**
 * 导航按钮组件
 * 使用Server Action进行导航并清除缓存
 */
export function NavigationButton({
  children,
  className,
  conversationId
}: NavigationButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (conversationId) {
        await navigateToConversation(conversationId);
      } else {
        await navigateToChat();
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${className} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isPending ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
} 