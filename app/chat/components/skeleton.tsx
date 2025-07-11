import { ReactNode } from "react";
import { Sparkles, AlertCircle } from "lucide-react";

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

// 错误文本展示组件
export function ErrorText({
  text = "出现错误",
  icon = true,
  className = "",
}: {
  text?: string;
  icon?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center space-x-2 text-red-500 dark:text-red-400 ${className}`}
    >
      {icon && <AlertCircle className="h-5 w-5" />}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

// 消息骨架屏
export function MessageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 用户消息骨架 */}
      <div className="flex justify-end px-2 sm:px-0">
        <div className="max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 shadow-lg sm:max-w-[80%] sm:px-4 sm:py-3 dark:bg-blue-500">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-blue-500 sm:w-48 dark:bg-blue-400" />
            <Skeleton className="h-4 w-24 bg-blue-500 sm:w-32 dark:bg-blue-400" />
          </div>
        </div>
      </div>

      {/* AI 响应骨架 */}
      <div className="flex justify-start px-2 sm:px-0">
        <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white sm:h-8 sm:w-8">
            <Sparkles size={14} className="sm:size-4" />
          </div>
          <div className="min-w-0 flex-1 bg-gray-50 px-3 py-2 shadow-sm sm:px-4 sm:py-3 dark:bg-slate-800/80">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[80%]" />
              <div className="mt-4 flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 对话历史骨架屏
export function ConversationHistorySkeleton() {
  return (
    <div className="h-fit w-full max-w-3xl flex-1 space-y-4 p-3 sm:p-6">
      <MessageSkeleton />
    </div>
  );
}

// 侧边栏骨架屏
export function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-72 -translate-x-full flex-col space-y-4 border-r border-gray-200 bg-white p-4 md:relative md:translate-x-0 dark:border-slate-700/50 dark:bg-slate-900/95">
      {/* 移动端标题栏占位 */}
      <div className="mb-4 pt-12 md:hidden">
        <Skeleton className="h-6 w-24" />
      </div>

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
    <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4 dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-2xl dark:shadow-slate-950/50">
        <Skeleton className="mb-2 h-12 w-full sm:h-16" />
        <div className="flex items-center justify-between">
          {/* 左侧提示骨架 */}
          <div className="flex items-center">
            <Skeleton className="h-3 w-3 rounded-full sm:h-3.5 sm:w-3.5" />
            <Skeleton className="ml-1 h-3 w-16 sm:w-28" />
          </div>
          {/* 右侧按钮骨架 */}
          <Skeleton className="h-9 w-9 rounded-full sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
}

// 聊天页面骨架屏
export function ChatPageSkeleton() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-slate-950">
      <div className="absolute left-0 top-6 z-10 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>
      <ConversationHistorySkeleton />
    </div>
  );
}

// 新对话页面骨架屏
export function NewChatSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
      <div className="w-full max-w-3xl">
        {/* 欢迎区域骨架 */}
        <div className="mb-8 text-center">
          {/* AI 图标骨架 */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>

          {/* 标题骨架 */}
          <Skeleton className="mx-auto mb-2 h-8 w-32 sm:h-9 sm:w-40" />

          {/* 描述文案骨架 */}
          <Skeleton className="mx-auto h-4 w-48 sm:w-64" />

          {/* 功能特点骨架 */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        <ChatInputSkeleton />
      </div>
    </div>
  );
}
