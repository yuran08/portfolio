import { createIdGenerator } from "ai";
import Chat from "./components/chat";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
export default function Page() {
  const chatId = createIdGenerator({
    prefix: "chat",
    size: 16,
  })();
  return (
    <Suspense fallback={<Skeleton />}>
      <Chat id={chatId} />
    </Suspense>
  );
}
