"use client";

import { startConversation } from "./action";
import ChatInput from "./chat-input";

export default function Chat() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <ChatInput action={startConversation} />
    </div>
  );
}
