import { Suspense } from "react";
import { ChatPageSkeleton } from "../../components/skeleton";
import ClientPage from "../../client-page";
import InitialMessages from "./initial-messages";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conversationId } = await params;

  return (
    <ClientPage
      conversationId={conversationId}
      initialMessages={
        <Suspense key={conversationId} fallback={<ChatPageSkeleton />}>
          <InitialMessages conversationId={conversationId} />
        </Suspense>
      }
    />
  );
}
