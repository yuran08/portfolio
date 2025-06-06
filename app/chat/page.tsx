import { Suspense } from "react";
import ChatPage from "./chat-page";
import { NewChatSkeleton } from "./skeleton";

export default function Chat() {
  return (
    <Suspense fallback={<NewChatSkeleton />}>
      <ChatPage />
    </Suspense>
  );
}
