import { Suspense } from "react";
import SideBar from "./side-bar";
import ChatPage from "./chat-page";
import { SidebarSkeleton, NewChatSkeleton } from "./skeleton";

export default function Chat() {
  return (
    <>
      <Suspense fallback={<SidebarSkeleton />}>
        <SideBar />
      </Suspense>
      <main className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950">
        <Suspense fallback={<NewChatSkeleton />}>
          <ChatPage />
        </Suspense>
      </main>
    </>
  );
}
