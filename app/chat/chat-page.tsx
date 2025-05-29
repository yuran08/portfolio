import { getInitConversationReactNode } from "./action";
import ChatInput from "./chat-input";
import { ConversationMessages } from "./conversation-messages";

export default async function ServerChatPage({
  conversationId,
}: {
  conversationId?: string;
}) {
  if (!conversationId) {
    return <NewChatView />;
  }

  const initialMessages = await getInitConversationReactNode(conversationId);

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-50 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      {/* 可滚动的消息区域 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto max-w-3xl">
          <ConversationMessages
            conversationId={conversationId}
            initialMessages={initialMessages}
          />
        </div>
      </div>

      {/* 固定在底部的输入框 */}
      <div className="sticky bottom-0 bg-white px-6 pb-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <ChatInput conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}

function NewChatView() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
      <div className="w-full max-w-3xl">
        <ChatInput />
      </div>
    </div>
  );
}
