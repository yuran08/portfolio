"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteConversation } from "./action";
import { useFormStatus } from "react-dom";
import { useRouter, usePathname } from "next/navigation";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-gray-300 group-hover:opacity-100 dark:hover:bg-slate-700/70"
      type="submit"
      aria-label="删除对话"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-slate-400" />
      ) : (
        <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400" />
      )}
    </button>
  );
}

export function DeleteConversationButton({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = async () => {
    try {
      await deleteConversation(conversationId);

      // 从路径中提取当前对话ID
      // 路径格式：/chat/conversation/{id} 或 /chat
      const pathSegments = pathname.split("/");
      const conversationIndex = pathSegments.indexOf("conversation");
      const currentConversationId =
        conversationIndex !== -1 && conversationIndex + 1 < pathSegments.length
          ? pathSegments[conversationIndex + 1]
          : null;

      // 只有删除的是当前正在查看的对话时才跳转
      if (currentConversationId === conversationId) {
        router.push("/chat");
      }
      // 如果删除的不是当前对话，不需要跳转，侧边栏会自动更新
    } catch (error) {
      console.error("删除对话失败:", error);
      // 可以在这里添加用户提示，比如toast通知
    }
  };

  return (
    <form action={handleDelete}>
      <DeleteButton />
    </form>
  );
}
