import { Suspense } from "react";
import { NewChatSkeleton } from "./components/skeleton";
import ChatInput from "./chat-input";
import Welcome from "./components/welcome";
import { v4 as uuidv4 } from "uuid";

export default function Chat() {
  return (
    <Suspense fallback={<NewChatSkeleton />}>
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="w-full max-w-3xl">
          <Welcome />
          <ChatInput conversationId={uuidv4()} />
        </div>
      </div>
    </Suspense>
  );
}
