"use client";

import { useConversation } from "./conversation-context";
import clsx from "clsx";
import { useState, useEffect } from "react";

export default function SideBar() {
  const { conversations, currentConversationId, setCurrentConversationId } =
    useConversation();
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件在客户端完全挂载后才应用选中样式
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConversationClick = (conversationId: string) => {
    // 立即更新 UI 状态
    setCurrentConversationId(conversationId);
    // 更新 URL 而不重新加载页面
    window.history.pushState(null, "", `/chat/conversation/${conversationId}`);
  };

  const handleNewChatClick = () => {
    setCurrentConversationId(null);
    window.history.pushState(null, "", "/chat");
  };

  return (
    <aside className="flex w-72 flex-col space-y-4 border-r border-gray-200 p-4">
      {/* <h1 className="text-2xl font-bold">𝓎𝓇 𝒸𝒽��𝓉</h1> */}
      <button
        onClick={handleNewChatClick}
        className="flex w-full items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-left font-semibold text-white transition-colors hover:bg-blue-700"
      >
        <span>&#x270E;</span>
        <span>开启新对话</span>
      </button>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* <p className="text-xs text-gray-400">昨天</p>
        <div className="cursor-pointer truncate rounded p-2 text-sm hover:bg-gray-200">
          placeholder
        </div>
        <p className="text-xs text-gray-400">7天内</p>
        <div className="cursor-pointer truncate rounded p-2 text-sm hover:bg-gray-200">
          placeholder
        </div> */}
        {/* <Suspense fallback={<div>Loading...</div>}> */}
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={clsx(
              "mb-2 h-fit w-full cursor-pointer overflow-hidden rounded p-2 text-ellipsis transition-all duration-300 hover:bg-gray-200",
              // 只有在客户端挂载后才应用选中样式，避免水合差异
              isMounted &&
                conversation.id === currentConversationId &&
                "bg-gray-200"
            )}
            onClick={() => handleConversationClick(conversation.id)}
            suppressHydrationWarning={true} // 抑制水合警告
          >
            <div className="w-full truncate text-sm">{conversation.id}</div>
          </div>
        ))}
        {/* </Suspense> */}
      </div>
      {/* <div className="mt-auto border-t border-gray-200 pt-4">
    <div className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-200">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white">
        Y
      </div>
          <span className="text-sm">个人信息</span>
        </div>
      </div> */}
    </aside>
  );
}
