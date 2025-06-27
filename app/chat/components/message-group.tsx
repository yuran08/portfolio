import { UserMessageWrapper, AssistantMessageWrapper } from "./message";
import { getAiResponseStream } from "../lib/ai/stream";
import StreamHandler from "./stream-handler";

export default function MessageGroup({
  userMessage,
  stream,
  conversationId,
}: {
  userMessage: React.ReactNode;
  stream: Awaited<ReturnType<typeof getAiResponseStream>>;
  conversationId: string;
}) {
  return (
    <>
      <UserMessageWrapper>{userMessage}</UserMessageWrapper>
      <AssistantMessageWrapper>
        <StreamHandler stream={stream} conversationId={conversationId} />
      </AssistantMessageWrapper>
    </>
  );
}
