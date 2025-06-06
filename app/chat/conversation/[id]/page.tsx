import { Suspense } from "react";
import ChatPage from "../../chat-page";
import { ChatPageSkeleton } from "../../skeleton";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatPage key={id} conversationId={id} />
    </Suspense>
  );
}
