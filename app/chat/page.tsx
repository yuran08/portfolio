import { Suspense } from "react";
import { NewChatSkeleton } from "./ui/skeleton";
import ChatInput from "./chat-input";

export default function Chat() {
  return (
    <Suspense fallback={<NewChatSkeleton />}>
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="w-full max-w-3xl">
          <ChatInput />
        </div>
      </div>
    </Suspense>
  );
}
