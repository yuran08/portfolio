"use client";

import { useState, ReactNode } from "react";
import { Message } from "./type";
import { getMessageFromFormData, getLLMResponseReactNode } from "./action";
import ChatInput from "./chat-input";

// export default function Chat() {
//   return (
//     <div className="flex h-full w-full flex-col items-center justify-center p-6">
//       <ChatInput action={startConversation} />
//     </div>
//   );
// }
export default function Chat() {
  const [messages, setMessagges] = useState<Message[]>([]);
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages.length > 0 ? messagesNode : null}
      </div>
      <ChatInput
        action={async (formData: FormData) => {
          const message = await getMessageFromFormData(formData);
          if (!message) return;
          const newMessages = [...messages, ...message];
          setMessagges(newMessages);
          const newMessagesNode = await getLLMResponseReactNode(newMessages);
          setMessagesNode([...messagesNode, newMessagesNode]);
        }}
      />
    </div>
  );
}
