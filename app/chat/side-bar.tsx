"use client";

import { useConversation } from "./conversation-context";
import clsx from "clsx";
import { Trash2, PencilLine } from "lucide-react";
import { useState, useEffect } from "react";
import { deleteConversation } from "./action";

export default function SideBar() {
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    setConversations,
  } = useConversation();
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

  const handleDeleteConversation = async (conversationId: string) => {
    console.log("handleDeleteConversation", conversationId);
    await deleteConversation(conversationId);
    setConversations(
      conversations.filter((conversation) => conversation.id !== conversationId)
    );
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
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={clsx(
              "mb-2 flex h-fit w-full cursor-pointer items-center justify-between overflow-hidden rounded p-2 text-ellipsis transition-all duration-300 hover:bg-gray-200",
              isMounted &&
                conversation.id === currentConversationId &&
                "bg-gray-200"
            )}
            onClick={() => handleConversationClick(conversation.id)}
          >
            <div className="w-1/2 truncate text-left text-sm">
              {conversation.title}
            </div>
            <div className="flex items-center space-x-2">
              {/* <PencilLine className="h-4 w-4 hover:text-blue-500" /> */}
              <Trash2
                className="h-4 w-4 hover:text-red-500"
                onClick={() => handleDeleteConversation(conversation.id)}
              />
            </div>
          </button>
        ))}
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
