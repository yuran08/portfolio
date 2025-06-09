"use server";

import { redirect } from "next/navigation";

/**
 * 导航到指定对话并清除相关缓存
 */
export async function navigateToConversation(conversationId: string) {
  // 重定向到目标对话
  redirect(`/chat/conversation/${conversationId}`);
}

/**
 * 导航到chat首页并清除缓存
 */
export async function navigateToChat() {
  // 重定向到chat首页
  redirect("/chat");
}
