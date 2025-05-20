import ChatInput from "../../chat-input";

export default async function Conversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(id);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"></div>
      <ChatInput />
    </div>
  );
}
