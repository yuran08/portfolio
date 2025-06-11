"use client";

import { Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import RenderFormPending from "./render-form-pending";
import { startConversation } from "./action";
import { useRouter } from "next/navigation";

export default function ChatInput({
  action,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  conversationId?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const isSendMessage = useRef(false);
  const router = useRouter();

  // 默认的处理函数
  const startConversationAction = async (formData: FormData) => {
    const message = String(formData.get("message"))?.trim();
    if (!message) return;

    if (isSendMessage.current) return;
    isSendMessage.current = true;

    const conversationId = await startConversation(message);
    isSendMessage.current = false;
    router.push(`/chat/conversation/${conversationId}`);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      // Estimate character height of one row, or use a fixed pixel value for two rows
      const twoRowsHeight =
        parseFloat(getComputedStyle(textareaRef.current).lineHeight) * 2;
      textareaRef.current.style.height = `${Math.max(scrollHeight, twoRowsHeight)}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => adjustTextareaHeight();
    textarea.addEventListener("input", handleInput);

    adjustTextareaHeight();

    return () => {
      textarea.removeEventListener("input", handleInput);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing || isSendMessage.current) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      formRef.current?.requestSubmit(); // 提交表单
    }
  };

  return (
    <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <form
        ref={formRef}
        action={action || startConversationAction}
        className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4 dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-2xl dark:shadow-slate-950/50"
      >
        <textarea
          ref={textareaRef}
          id="message"
          name="message"
          rows={2}
          placeholder="问任何事情..."
          className="w-full resize-none border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-500 text-base sm:text-sm"
          style={{ overflowY: "hidden" }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
        <div className="flex items-center justify-end mt-2">
          {/* 提交按钮 */}
          <button
            type="submit"
            className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-colors duration-200 hover:bg-blue-600 active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:p-2.5"
          >
            <RenderFormPending
              pendingNode={<Loader2 className="h-4 w-4 animate-spin" />}
              notPendingNode={
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 16c-.595 0-1.077-.462-1.077-1.032V1.032C5.923.462 6.405 0 7 0s1.077.462 1.077 1.032v13.936C8.077 15.538 7.595 16 7 16z"
                    fill="currentColor"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M.315 7.44a1.002 1.002 0 0 1 0-1.46L6.238.302a1.11 1.11 0 0 1 1.523 0c.421.403.421 1.057 0 1.46L1.838 7.44a1.11 1.11 0 0 1-1.523 0z"
                    fill="currentColor"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.685 7.44a1.11 1.11 0 0 1-1.523 0L6.238 1.762a1.002 1.002 0 0 1 0-1.46 1.11 1.11 0 0 1 1.523 0l5.924 5.678c.42.403.42 1.056 0 1.46z"
                    fill="currentColor"
                  ></path>
                </svg>
              }
            />
          </button>
        </div>
      </form>
    </div>
  );
}
