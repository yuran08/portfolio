"use client";

import { useActions, useUIState } from "@ai-sdk/rsc";
import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { AI } from "../ai";
import { FormEvent } from "react";
import { UserMessageWrapper } from "./message";
import { ClientMessage } from "../action";
import Welcome from "./welcome";

export default function Chat() {
  const { sendMessage } = useActions<typeof AI>();
  const [messages, setMessages] = useUIState();
  console.log(messages, "messages");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 修复类型错误，使用 FormData 来获取表单数据
    const formData = new FormData(event.currentTarget);
    const userMessage = formData.get("message") as string;
    event.currentTarget.reset();

    const savedUserMessageHistory = [
      ...messages,
      {
        id: Date.now(),
        role: "user",
        display: <UserMessageWrapper>{userMessage}</UserMessageWrapper>,
      },
    ];
    setMessages(savedUserMessageHistory);

    const response = await sendMessage(userMessage);

    setMessages([
      ...savedUserMessageHistory,
      { id: Date.now(), role: "assistant", display: response },
    ]);
  };

  if (!messages.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="w-full max-w-3xl">
          <Welcome />
          <ChatInput handleSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-10 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      <ChatMessages messages={messages} />

      <div className="sticky bottom-0 bg-white px-6 pb-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <ChatInput handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
