import { createIdGenerator } from "ai";
import Chat from "./components/chat";

export default function Page() {
  const chatId = createIdGenerator({
    prefix: "chat",
    size: 16,
  })();
  return <Chat id={chatId} />;
}
