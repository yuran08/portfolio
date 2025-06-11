import { v4 as uuidv4 } from "uuid";
import { getRedisConnection, generateRedisKey } from "./redis";
import { Message } from "@/app/chat/type";
import {
  parseContentSafely,
  safeJsonStringify,
  needsJsonStringify,
} from "./json";

// Redis 数据结构定义
export interface RedisMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: Message["content"];
  createdAt: string;
  updatedAt: string;
  conversationId: string;
}

export interface RedisConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// 辅助函数：验证 Redis 数据完整性
const isValidRedisData = (data: unknown): data is Record<string, unknown> => {
  return data !== null && typeof data === "object";
};

/**
 * 消息存储类
 *
 * 【存储设计】
 * - 使用 Hash 存储单个消息的详细信息
 * - 使用 ZSet 存储对话下的消息列表（按时间排序）
 * - 使用计数器生成消息时间戳作为排序依据
 */
export class MessageStore {
  /**
   * 创建新消息
   *
   * @param data - 消息创建数据
   * @returns Promise<RedisMessage> 创建的消息对象
   */
  static async create(data: {
    content: Message["content"];
    role: "user" | "assistant" | "tool";
    conversationId: string;
  }): Promise<RedisMessage> {
    const redis = await getRedisConnection();
    const messageId = uuidv4();
    const now = new Date().toLocaleString();

    // 构建消息对象
    const message: RedisMessage = {
      id: messageId,
      role: data.role,
      content: data.content,
      createdAt: now,
      updatedAt: now,
      conversationId: data.conversationId,
    };

    // 获取时间戳用于排序（使用递增计数器确保顺序）
    const timestamp = await redis.incr("message_counter");

    try {
      // 智能序列化内容
      const serializedContent = needsJsonStringify(data.content)
        ? safeJsonStringify(data.content) || String(data.content)
        : String(data.content);

      // 使用 Pipeline 批量操作，提高性能
      const pipeline = redis.pipeline();

      // 1. 存储消息详情到 Hash
      pipeline.hset(generateRedisKey.message(messageId), {
        id: messageId,
        role: data.role,
        content: serializedContent,
        createdAt: now,
        updatedAt: now,
        conversationId: data.conversationId,
      });

      // 2. 将消息添加到对话的消息列表（ZSet，按时间戳排序）
      pipeline.zadd(
        generateRedisKey.conversationMessages(data.conversationId),
        timestamp,
        messageId
      );

      // 3. 更新对话的最后更新时间
      pipeline.hset(
        generateRedisKey.conversation(data.conversationId),
        "updatedAt",
        now
      );

      // 执行所有操作
      await pipeline.exec();

      return message;
    } catch (error) {
      console.error("❌ 创建消息失败:", error);
      throw new Error(
        `创建消息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  /**
   * 根据 ID 查找消息
   *
   * @param id - 消息 ID
   * @returns Promise<RedisMessage | null> 消息对象或 null
   */
  static async findById(id: string): Promise<RedisMessage | null> {
    const redis = await getRedisConnection();

    try {
      const data = await redis.hgetall(generateRedisKey.message(id));

      if (!isValidRedisData(data) || Object.keys(data).length === 0) {
        return null;
      }

      return {
        id: data.id as string,
        role: data.role as "user" | "assistant" | "tool",
        content: parseContentSafely(data.content as string),
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
        conversationId: data.conversationId as string,
      };
    } catch (error) {
      console.error(`❌ 查找消息失败 (${id}):`, error);
      return null;
    }
  }

  /**
   * 根据对话 ID 查找所有消息
   *
   * @param conversationId - 对话 ID
   * @returns Promise<RedisMessage[]> 消息列表（按时间排序）
   */
  static async findByConversationId(
    conversationId: string
  ): Promise<RedisMessage[]> {
    const redis = await getRedisConnection();

    try {
      // 1. 从 ZSet 获取该对话的所有消息 ID（按时间戳排序）
      const messageIds = await redis.zrange(
        generateRedisKey.conversationMessages(conversationId),
        0,
        -1
      );

      if (messageIds.length === 0) {
        return [];
      }

      // 2. 批量获取消息详情
      const pipeline = redis.pipeline();
      messageIds.forEach((messageId) => {
        pipeline.hgetall(generateRedisKey.message(messageId));
      });

      const results = await pipeline.exec();
      const messages: RedisMessage[] = [];

      // 3. 处理批量查询结果
      if (results) {
        results.forEach((result, index) => {
          if (result && result[0] === null) {
            // 无错误
            const data = result[1] as Record<string, string>;
            if (isValidRedisData(data) && Object.keys(data).length > 0) {
              messages.push({
                id: data.id,
                role: data.role as "user" | "assistant" | "tool",
                content: parseContentSafely(data.content),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                conversationId: data.conversationId,
              });
            }
          } else {
            console.warn(
              `⚠️ 获取消息失败 (${messageIds[index]}):`,
              result?.[0]
            );
          }
        });
      }

      return messages;
    } catch (error) {
      console.error(`❌ 获取对话消息失败 (${conversationId}):`, error);
      return [];
    }
  }

  /**
   * 更新消息
   *
   * @param id - 消息 ID
   * @param data - 更新数据
   * @returns Promise<RedisMessage | null> 更新后的消息对象
   */
  static async update(
    id: string,
    data: { content?: Message["content"] }
  ): Promise<RedisMessage | null> {
    const redis = await getRedisConnection();

    try {
      const existing = await MessageStore.findById(id);
      if (!existing) {
        console.warn(`⚠️ 消息不存在: ${id}`);
        return null;
      }

      const now = new Date().toLocaleString();
      const updateFields: Record<string, string> = {
        updatedAt: now,
      };

      if (data.content !== undefined) {
        const serializedContent = needsJsonStringify(data.content)
          ? safeJsonStringify(data.content) || String(data.content)
          : String(data.content);
        updateFields.content = serializedContent;
      }

      await redis.hset(generateRedisKey.message(id), updateFields);

      return await MessageStore.findById(id);
    } catch (error) {
      console.error(`❌ 更新消息失败 (${id}):`, error);
      return null;
    }
  }

  /**
   * 删除消息
   *
   * @param id - 消息 ID
   * @returns Promise<boolean> 删除是否成功
   */
  static async delete(id: string): Promise<boolean> {
    const redis = await getRedisConnection();

    try {
      const message = await MessageStore.findById(id);
      if (!message) {
        console.warn(`⚠️ 消息不存在: ${id}`);
        return false;
      }

      const pipeline = redis.pipeline();

      // 1. 删除消息详情
      pipeline.del(generateRedisKey.message(id));

      // 2. 从对话消息列表中移除
      pipeline.zrem(
        generateRedisKey.conversationMessages(message.conversationId),
        id
      );

      await pipeline.exec();

      return true;
    } catch (error) {
      console.error(`❌ 删除消息失败 (${id}):`, error);
      return false;
    }
  }
}

/**
 * 对话存储类
 *
 * 【存储设计】
 * - 使用 Hash 存储对话的详细信息
 * - 使用 ZSet 存储所有对话列表（按更新时间排序）
 */
export class ConversationStore {
  /**
   * 创建新对话
   *
   * @param data - 对话创建数据
   * @returns Promise<RedisConversation> 创建的对话对象
   */
  static async create(data: { title: string }): Promise<RedisConversation> {
    const redis = await getRedisConnection();
    const conversationId = uuidv4();
    const now = new Date().toLocaleString();

    const conversation: RedisConversation = {
      id: conversationId,
      title: data.title,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const timestamp = Date.now(); // 使用时间戳进行排序

      const pipeline = redis.pipeline();

      // 1. 存储对话详情
      pipeline.hset(generateRedisKey.conversation(conversationId), {
        id: conversationId,
        title: data.title,
        createdAt: now,
        updatedAt: now,
      });

      // 2. 添加到对话列表
      pipeline.zadd("conversations", timestamp, conversationId);

      await pipeline.exec();

      return conversation;
    } catch (error) {
      console.error("❌ 创建对话失败:", error);
      throw new Error(
        `创建对话失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  /**
   * 根据 ID 查找对话
   *
   * @param id - 对话 ID
   * @returns Promise<RedisConversation | null> 对话对象或 null
   */
  static async findById(id: string): Promise<RedisConversation | null> {
    const redis = await getRedisConnection();

    try {
      const data = await redis.hgetall(generateRedisKey.conversation(id));

      if (!isValidRedisData(data) || Object.keys(data).length === 0) {
        return null;
      }

      return {
        id: data.id as string,
        title: data.title as string,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      };
    } catch (error) {
      console.error(`❌ 查找对话失败 (${id}):`, error);
      return null;
    }
  }

  /**
   * 获取所有对话
   *
   * @returns Promise<RedisConversation[]> 对话列表（按更新时间倒序）
   */
  static async findMany(): Promise<RedisConversation[]> {
    const redis = await getRedisConnection();

    try {
      // 1. 获取所有对话 ID（按时间戳倒序）
      const conversationIds = await redis.zrevrange("conversations", 0, -1);

      if (conversationIds.length === 0) {
        return [];
      }

      // 2. 批量获取对话详情
      const pipeline = redis.pipeline();
      conversationIds.forEach((conversationId) => {
        pipeline.hgetall(generateRedisKey.conversation(conversationId));
      });

      const results = await pipeline.exec();
      const conversations: RedisConversation[] = [];

      // 3. 处理批量查询结果
      if (results) {
        results.forEach((result, index) => {
          if (result && result[0] === null) {
            // 无错误
            const data = result[1] as Record<string, string>;
            if (isValidRedisData(data) && Object.keys(data).length > 0) {
              conversations.push({
                id: data.id,
                title: data.title,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              });
            }
          } else {
            console.warn(
              `⚠️ 获取对话失败 (${conversationIds[index]}):`,
              result?.[0]
            );
          }
        });
      }

      return conversations;
    } catch (error) {
      console.error("❌ 获取对话列表失败:", error);
      return [];
    }
  }

  /**
   * 获取包含消息的对话列表
   *
   * @returns Promise<RedisConversation[]> 包含消息的对话列表
   */
  static async findManyWithMessages(): Promise<RedisConversation[]> {
    // 由于消息数据可能很大，这里只返回对话基本信息
    // 消息数据通过 MessageStore.findByConversationId 按需获取
    return await ConversationStore.findMany();
  }

  /**
   * 更新对话
   *
   * @param id - 对话 ID
   * @param data - 更新数据
   * @returns Promise<RedisConversation | null> 更新后的对话对象
   */
  static async update(
    id: string,
    data: { title?: string }
  ): Promise<RedisConversation | null> {
    const redis = await getRedisConnection();

    try {
      const existing = await ConversationStore.findById(id);
      if (!existing) {
        console.warn(`⚠️ 对话不存在: ${id}`);
        return null;
      }

      const now = new Date().toLocaleString();
      const updateFields: Record<string, string> = {
        updatedAt: now,
      };

      if (data.title !== undefined) {
        updateFields.title = data.title;
      }

      // 更新对话详情和排序
      const timestamp = Date.now();
      const pipeline = redis.pipeline();

      pipeline.hset(generateRedisKey.conversation(id), updateFields);
      pipeline.zadd("conversations", timestamp, id); // 更新排序时间

      await pipeline.exec();

      return await ConversationStore.findById(id);
    } catch (error) {
      console.error(`❌ 更新对话失败 (${id}):`, error);
      return null;
    }
  }

  /**
   * 删除对话
   *
   * @param id - 对话 ID
   * @returns Promise<boolean> 删除是否成功
   */
  static async delete(id: string): Promise<boolean> {
    const redis = await getRedisConnection();

    try {
      // 1. 获取对话下的所有消息 ID
      const messageIds = await redis.zrange(
        generateRedisKey.conversationMessages(id),
        0,
        -1
      );

      const pipeline = redis.pipeline();

      // 2. 删除所有相关消息
      messageIds.forEach((messageId) => {
        pipeline.del(generateRedisKey.message(messageId));
      });

      // 3. 删除对话消息列表
      pipeline.del(generateRedisKey.conversationMessages(id));

      // 4. 删除对话详情
      pipeline.del(generateRedisKey.conversation(id));

      // 5. 从对话列表中移除
      pipeline.zrem("conversations", id);

      await pipeline.exec();

      return true;
    } catch (error) {
      console.error(`❌ 删除对话失败 (${id}):`, error);
      return false;
    }
  }
}
