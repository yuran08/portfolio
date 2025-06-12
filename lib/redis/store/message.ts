/**
 * 消息存储类
 *
 * 专门处理消息的Redis存储操作
 */

import { v4 as uuidv4 } from "uuid";
import { getRedisConnection } from "../connection";
import { generateRedisKey, generateCacheKey } from "../keys";
import { cache } from "../cache";
import type {
  RedisMessage,
  CreateMessageData,
  UpdateMessageData,
} from "./types";
import { isValidRedisData } from "./types";
import {
  parseContentSafely,
  safeJsonStringify,
  needsJsonStringify,
} from "@/lib/json";

/**
 * 消息存储类
 *
 * 【存储设计】
 * - 使用 Hash 存储单个消息的详细信息
 * - 使用 ZSet 存储对话下的消息列表（按时间排序）
 * - 使用计数器生成消息时间戳作为排序依据
 * - 使用内存缓存减少Redis访问
 */
export class MessageStore {
  /**
   * 创建新消息
   *
   * @param data - 消息创建数据
   * @returns Promise<RedisMessage> 创建的消息对象
   */
  static async create(data: CreateMessageData): Promise<RedisMessage> {
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

      // 4. 更新对话在列表中的排序位置（使用消息时间戳保证最新活动的对话排在前面）
      pipeline.zadd("conversations", timestamp, data.conversationId);

      // 执行所有操作
      await pipeline.exec();

      // 🚀 缓存新创建的消息
      cache.set(generateCacheKey.message(messageId), message);

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
    // 🚀 先检查内存缓存
    const cacheKey = generateCacheKey.message(id);
    const cached = cache.get(cacheKey) as RedisMessage | null;
    if (cached) {
      return cached;
    }

    const redis = await getRedisConnection();

    try {
      const data = await redis.hgetall(generateRedisKey.message(id));

      if (!isValidRedisData(data) || Object.keys(data).length === 0) {
        return null;
      }

      const message: RedisMessage = {
        id: data.id as string,
        role: data.role as "user" | "assistant" | "tool",
        content: parseContentSafely(data.content as string),
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
        conversationId: data.conversationId as string,
      };

      // 🚀 缓存结果（缓存5分钟）
      cache.set(cacheKey, message);

      return message;
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
              const message: RedisMessage = {
                id: data.id,
                role: data.role as "user" | "assistant" | "tool",
                content: parseContentSafely(data.content),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                conversationId: data.conversationId,
              };
              messages.push(message);

              // 🚀 缓存消息
              cache.set(generateCacheKey.message(message.id), message);
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
    data: UpdateMessageData
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

      // 🚀 清除缓存，让下次查询时重新获取最新数据
      cache.delete(generateCacheKey.message(id));

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

      // 🚀 清除缓存
      cache.delete(generateCacheKey.message(id));

      return true;
    } catch (error) {
      console.error(`❌ 删除消息失败 (${id}):`, error);
      return false;
    }
  }

  /**
   * 批量删除消息
   *
   * @param ids - 消息ID数组
   * @returns Promise<number> 成功删除的消息数量
   */
  static async deleteMany(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const redis = await getRedisConnection();
    let successCount = 0;

    try {
      const pipeline = redis.pipeline();

      // 批量删除消息
      for (const id of ids) {
        pipeline.del(generateRedisKey.message(id));
      }

      const results = await pipeline.exec();

      // 统计成功删除的数量
      results?.forEach((result, index) => {
        if (result && result[0] === null && result[1] === 1) {
          successCount++;
          // 清除缓存
          cache.delete(generateCacheKey.message(ids[index]));
        }
      });

      console.log(
        `✅ 批量删除消息完成，成功删除 ${successCount}/${ids.length} 条消息`
      );
      return successCount;
    } catch (error) {
      console.error("❌ 批量删除消息失败:", error);
      return successCount;
    }
  }

  /**
   * 获取消息统计信息
   *
   * @param conversationId - 对话ID（可选）
   * @returns Promise<{ total: number; byRole: Record<string, number> }>
   */
  static async getStats(conversationId?: string): Promise<{
    total: number;
    byRole: Record<string, number>;
  }> {
    try {
      let messages: RedisMessage[];

      if (conversationId) {
        messages = await MessageStore.findByConversationId(conversationId);
      } else {
        // 获取所有消息统计（这里简化实现，实际可能需要更高效的方法）
        messages = [];
      }

      const byRole: Record<string, number> = {};
      messages.forEach((message) => {
        byRole[message.role] = (byRole[message.role] || 0) + 1;
      });

      return {
        total: messages.length,
        byRole,
      };
    } catch (error) {
      console.error("❌ 获取消息统计失败:", error);
      return { total: 0, byRole: {} };
    }
  }
}
