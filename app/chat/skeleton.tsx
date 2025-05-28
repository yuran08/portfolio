import { ReactNode } from "react";

// 基础 Skeleton 组件
export function Skeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}

// 消息骨架屏
export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {/* 用户消息骨架 */}
      <div className="my-4 rounded-2xl border border-gray-200 bg-gray-100 p-6 dark:border-slate-700/60 dark:bg-slate-800/80">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* AI 响应骨架 */}
      <div className="my-4 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-indigo-500/30 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-indigo-950/40">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <div className="mt-4 flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 对话历史骨架屏
export function ConversationHistorySkeleton() {
  return (
    <div className="w-full max-w-3xl flex-1 space-y-4 p-6">
      {[1, 2].map((i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  );
}

// 侧边栏骨架屏
export function SidebarSkeleton() {
  return (
    <aside className="flex w-72 flex-col space-y-4 border-r border-gray-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-900/95">
      {/* 新建对话按钮骨架 */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* 对话列表骨架 */}
      <div className="flex-1 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="group relative">
            <Skeleton className="h-12 w-full rounded" />
          </div>
        ))}
      </div>
    </aside>
  );
}

// 聊天输入框骨架屏
export function ChatInputSkeleton() {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-2xl dark:shadow-slate-950/50">
      <Skeleton className="mb-4 h-16 w-full" />
      <div className="flex items-center justify-end">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

// 聊天页面骨架屏
export function ChatPageSkeleton() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-slate-950">
      <div className="absolute left-0 top-6 z-50 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>
      <ConversationHistorySkeleton />
      <ChatInputSkeleton />
    </div>
  );
}

// 新对话页面骨架屏
export function NewChatSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
      <div className="space-y-6 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <ChatInputSkeleton />
      </div>
    </div>
  );
}

// 加载指示器组件
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-slate-600 dark:border-t-indigo-400 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}

// 带文字的加载组件
export function LoadingWithText({
  text = "加载中...",
  size = "md",
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600 dark:text-slate-400">{text}</span>
    </div>
  );
}
