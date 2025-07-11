"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { SubmitBtn } from "./submit-btn";
import { ModelSwitcher } from "./model-switcher";

const ChatInput = ({
  sendMessage,
  model,
  setModel,
  isLoading,
  stop,
}: {
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  model: "deepseek-chat" | "deepseek-reasoner";
  setModel: (model: "deepseek-chat" | "deepseek-reasoner") => void;
  stop: ReturnType<typeof useChat>["stop"];
  isLoading: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const isSendMessage = useRef(false);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
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
        className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4 dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-2xl dark:shadow-slate-950/50"
        onSubmit={(e) => {
          const message = textareaRef.current?.value;
          if (!message || message.trim() === "") {
            return;
          }
          e.preventDefault();
          textareaRef.current!.value = "";
          sendMessage(
            {
              id: Date.now().toString(),
              role: "user",
              parts: [
                {
                  type: "text",
                  text: message,
                },
              ],
            },
            {
              body: {
                model,
              },
            }
          );
        }}
      >
        <textarea
          ref={textareaRef}
          id="message"
          name="message"
          rows={2}
          placeholder="问任何事情..."
          className="w-full resize-none border-none bg-transparent text-base text-gray-700 placeholder-gray-400 focus:outline-none sm:text-sm dark:text-slate-200 dark:placeholder-slate-500"
          style={{ overflowY: "hidden" }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
        <div className="mt-2 flex items-center justify-between">
          <ModelSwitcher model={model} setModel={setModel} />
          {/* 提交按钮 */}
          <SubmitBtn isLoading={isLoading} stop={stop} />
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
