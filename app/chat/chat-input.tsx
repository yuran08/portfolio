"use client";

import { SendIcon, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import RenderFormPending from "./render-form-pending";

export default function ChatInput({
  action,
}: {
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isComposing, setIsComposing] = useState(false);

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
    if (isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      formRef.current?.requestSubmit(); // 提交表单
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      <textarea
        ref={textareaRef}
        id="message"
        name="message"
        rows={2}
        placeholder="问任何事情..."
        className="w-full resize-none border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
        style={{ overflowY: "hidden" }}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="rounded-full bg-blue-500 flex items-center justify-center p-2 text-white hover:bg-blue-600"
        >
          <RenderFormPending
            pendingNode={<Loader2 className="h-4 w-4 animate-spin" />}
            notPendingNode={<SendIcon className="h-4 w-4" />}
          />
        </button>
      </div>
    </form>
  );
}
