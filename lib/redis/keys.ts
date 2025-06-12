/**
 * Redis 键管理
 *
 * 统一管理所有Redis键的生成和管理，避免键名冲突
 */

// Redis键前缀常量
export const REDIS_KEYS = {
  CONVERSATION: "conversation:",
  MESSAGE: "message:",
  CONVERSATION_MESSAGES: "conversation_messages:",
  CONVERSATION_LIST: "conversations",
  MESSAGE_COUNTER: "message_counter",
} as const;

// 工具函数：生成Redis键
export const generateRedisKey = {
  /**
   * 生成对话键
   * @param id 对话ID
   * @returns Redis键
   */
  conversation: (id: string) => `${REDIS_KEYS.CONVERSATION}${id}`,

  /**
   * 生成消息键
   * @param id 消息ID
   * @returns Redis键
   */
  message: (id: string) => `${REDIS_KEYS.MESSAGE}${id}`,

  /**
   * 生成对话消息列表键
   * @param conversationId 对话ID
   * @returns Redis键
   */
  conversationMessages: (conversationId: string) =>
    `${REDIS_KEYS.CONVERSATION_MESSAGES}${conversationId}`,
};

/**
 * 缓存键生成器
 */
export const generateCacheKey = {
  /**
   * 生成消息缓存键
   * @param id 消息ID
   * @returns 缓存键
   */
  message: (id: string) => `cache:message:${id}`,

  /**
   * 生成对话缓存键
   * @param id 对话ID
   * @returns 缓存键
   */
  conversation: (id: string) => `cache:conversation:${id}`,
};
