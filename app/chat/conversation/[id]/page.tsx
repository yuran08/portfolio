import SideBar from "../../side-bar";
import ChatPage from "../../chat-page";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SideBar currentConversationId={id} />
      <main className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950">
        <ChatPage conversationId={id} />
      </main>
    </>
  );
}
