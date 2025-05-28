import { Suspense } from "react";
import SideBar from "../../side-bar";
import ChatPage from "../../chat-page";
import { SidebarSkeleton, ChatPageSkeleton } from "../../skeleton";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <SideBar currentConversationId={id} />
      </Suspense>
      <main className="flex flex-1 flex-col bg-white dark:bg-slate-950">
        <Suspense fallback={<ChatPageSkeleton />}>
          <ChatPage conversationId={id} />
        </Suspense>
      </main>
    </>
  );
}
