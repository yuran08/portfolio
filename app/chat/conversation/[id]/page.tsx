import Link from "next/link";
import prisma from "@/lib/prisma";
import ClientPage from "./client-page";
import {
  getInitConversationReactNode,
  conversationAddMessage,
} from "../../action";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id,
    },
  });

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div>Conversation not found</div>
        <Link href="/chat" className="text-blue-500">
          back to chat
        </Link>
      </div>
    );
  }

  return (
    <ClientPage
      conversationId={id}
      initConversationReactNode={await getInitConversationReactNode(id)}
      conversationAddMessage={conversationAddMessage}
    />
  );
}
