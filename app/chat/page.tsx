import SideBar from "./side-bar";
import ChatPage from "./chat-page";

export default function Chat() {
  return (
    <>
      <SideBar />
      <main className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950">
        <ChatPage />
      </main>
    </>
  );
}
