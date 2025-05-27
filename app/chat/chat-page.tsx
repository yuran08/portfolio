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
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-slate-950">
      <div className="absolute left-0 top-6 z-50 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      <ConversationMessages
        conversationId={conversationId}
        initialMessages={initialMessages}
      />

      <ChatInput conversationId={conversationId} />
    </div>
  );
}

function NewChatView() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
      <ChatInput />
    </div>
  );
}
