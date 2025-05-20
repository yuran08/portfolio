"use client";

import { useRef, useEffect, useState } from "react";

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
        placeholder="ask me anything..."
        className="w-full resize-none border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
        style={{ overflowY: "hidden" }}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            <svg
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 16c-.595 0-1.077-.462-1.077-1.032V1.032C5.923.462 6.405 0 7 0s1.077.462 1.077 1.032v13.936C8.077 15.538 7.595 16 7 16z"
                fill="currentColor"
              ></path>
              <path
                d="M.315 7.44a1.002 1.002 0 0 1 0-1.46L6.238.302a1.11 1.11 0 0 1 1.523 0c.421.403.421 1.057 0 1.46L1.838 7.44a1.11 1.11 0 0 1-1.523 0z"
                fill="currentColor"
              ></path>
              <path
                d="M13.685 7.44a1.11 1.11 0 0 1-1.523 0L6.238 1.762a1.002 1.002 0 0 1 0-1.46 1.11 1.11 0 0 1 1.523 0l5.924 5.678c.42.403.42 1.056 0 1.46z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
