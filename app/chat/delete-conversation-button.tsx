"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteConversation } from "./action";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

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

  const handleDelete = async () => {
    await deleteConversation(conversationId);
    router.push("/chat");
  };

  return (
    <form action={handleDelete}>
      <DeleteButton />
    </form>
  );
}
