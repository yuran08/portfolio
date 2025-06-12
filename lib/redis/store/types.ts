/**
 * Redis 数据结构类型定义
 *
 * 定义所有Redis存储相关的类型和接口
 */

import type { Message } from "@/app/chat/type";

/**
 * Redis 消息数据结构
 */
export interface RedisMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: Message["content"];
  createdAt: string;
  updatedAt: string;
  conversationId: string;
}

/**
 * Redis 对话数据结构
 */
export interface RedisConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 消息创建数据
 */
export interface CreateMessageData {
  content: Message["content"];
  role: "user" | "assistant" | "tool";
  conversationId: string;
}

/**
 * 消息更新数据
 */
export interface UpdateMessageData {
  content?: Message["content"];
}

/**
 * 对话创建数据
 */
export interface CreateConversationData {
  title: string;
}

/**
 * 对话更新数据
 */
export interface UpdateConversationData {
  title?: string;
}

/**
 * 辅助函数：验证 Redis 数据完整性
 */
export const isValidRedisData = (
  data: unknown
): data is Record<string, unknown> => {
  return data !== null && typeof data === "object";
};

/**
 * Redis存储操作结果类型
 */
export interface RedisOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult<T> {
  success: boolean;
  results: T[];
  errors: string[];
}

/**
 * 存储统计信息
 */
export interface StorageStats {
  messageCount: number;
  conversationCount: number;
  cacheHitRate: number;
  compressionRatio: number;
}
