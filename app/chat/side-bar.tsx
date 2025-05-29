import Link from "next/link";
import { getConversationList } from "./action";
import { DeleteConversationButton } from "./delete-conversation-button";

export default async function ServerSideBar({
  currentConversationId,
}: {
  currentConversationId?: string;
}) {
  const conversations = await getConversationList();

  return (
    <aside className="flex w-72 flex-col space-y-4 border-r border-gray-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-900/95">
      <Link
        href="/chat"
        className="flex w-full cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-left font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        <span>&#x270E;</span>
        <span>开启新对话</span>
      </Link>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="group relative">
            <Link
              href={`/chat/conversation/${conversation.id}`}
              className={`flex h-12 w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm text-gray-900 transition-all duration-300 hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-800/70 ${
                conversation.id === currentConversationId
                  ? "bg-gray-200 dark:bg-slate-800/90"
                  : ""
              }`}
            >
              <span className="truncate">{conversation.title}</span>
            </Link>

            <DeleteConversationButton conversationId={conversation.id} />
          </div>
        ))}
      </div>
    </aside>
  );
}
