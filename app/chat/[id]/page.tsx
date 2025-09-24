import Chat from "../components/chat";
import { loadChat } from "../lib/db/actions";
import { MyUIMessage } from "../lib/message-type";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialMessages = [] as MyUIMessage[];
  try {
    initialMessages = await loadChat(id);
  } catch (error) {
    console.error("load chat error:", error);
  }

  return <Chat id={id} initialMessages={initialMessages} />;
}
