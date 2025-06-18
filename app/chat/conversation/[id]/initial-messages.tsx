import { getInitConversationReactNode } from "../../action";

/**
 * 这是一个独立的异步服务端组件，专门用于加载初始消息。
 * 这种模式允许页面的其余部分（如布局和输入框）立即渲染，
 * 而这个组件的数据获取则在后台进行，并通过 Suspense 流式传输到客户端。
 */
export default async function InitialMessages({
  conversationId,
}: {
  conversationId: string;
}) {
  const initialMessages = await getInitConversationReactNode(conversationId);
  return initialMessages;
}
