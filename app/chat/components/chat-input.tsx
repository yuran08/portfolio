"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { SubmitBtn } from "./submit-btn";
import { SearchModeToggle } from "./search-mode-toggle";
import { ModelToggle } from "./model-toggle";
import { Textarea } from "@/components/ui/textarea";
import { createIdGenerator } from "ai";
import { MyUIMessage } from "../lib/message-type";

const ChatInput = ({
  sendMessage,
  isLoading,
  stop,
}: {
  sendMessage: ReturnType<typeof useChat<MyUIMessage>>["sendMessage"];
  stop: ReturnType<typeof useChat>["stop"];
  isLoading: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState<boolean | undefined>(false);
  const [isReasonerModel, setIsReasonerModel] = useState<boolean | undefined>(
    false
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      textareaRef.current?.value.trim() && formRef.current?.requestSubmit(); // 提交表单
    }
  };

  return (
    <div className="px-3 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4">
      <form
        ref={formRef}
        className="w-full rounded-xl border bg-accent p-3 sm:p-4 dark:shadow-2xl dark:shadow-slate-950/50"
        onSubmit={(e) => {
          const message = textareaRef.current?.value;
          if (!message || message.trim() === "") {
            return;
          }
          e.preventDefault();
          textareaRef.current!.value = "";
          sendMessage({
            id: createIdGenerator({
              prefix: "msg",
              size: 16,
            })(),
            role: "user",
            parts: [
              {
                type: "text",
                text: message,
              },
            ],
          });
        }}
      >
        <Textarea
          ref={textareaRef}
          id="message"
          name="message"
          rows={2}
          placeholder="问任何事情..."
          className="w-full resize-none border-0 bg-transparent text-base text-gray-700 placeholder-gray-400 shadow-none focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none sm:text-sm dark:bg-transparent dark:text-slate-200"
          spellCheck
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ModelToggle
              isReasonerModel={isReasonerModel}
              setIsSearchMode={setIsSearchMode}
              setIsReasonerModel={setIsReasonerModel}
            />
            <SearchModeToggle
              isSearchMode={isSearchMode}
              setIsSearchMode={setIsSearchMode}
              setIsReasonerModel={setIsReasonerModel}
            />
            <div className="text-sm text-gray-400">
              推理模型暂不支持联网功能
            </div>
          </div>
          {/* 提交按钮 */}
          <SubmitBtn isLoading={isLoading} stop={stop} />
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
