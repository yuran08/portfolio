import { Suspense } from "react";
import { ChatPageSkeleton } from "../../ui/skeleton";
import ClientPage from "../../client-page";
import { getInitConversationReactNode } from "../../action";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conversationId } = await params;

  const initialMessages = await getInitConversationReactNode(conversationId);

  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ClientPage
        conversationId={conversationId}
        initialMessages={initialMessages}
      />
    </Suspense>
  );
}
