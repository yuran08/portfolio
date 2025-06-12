/**
 * 对话存储类
 *
 * 专门处理对话的Redis存储操作
 */

import { v4 as uuidv4 } from "uuid";
import { getRedisConnection } from "../connection";
import { generateRedisKey, generateCacheKey } from "../keys";
import { cache } from "../cache";
import type {
  RedisConversation,
  CreateConversationData,
  UpdateConversationData,
} from "./types";
import { isValidRedisData } from "./types";

/**
 * 对话存储类
 *
 * 【存储设计】
 * - 使用 Hash 存储对话的详细信息
 * - 使用 ZSet 存储所有对话列表（按更新时间排序）
 * - 使用内存缓存提升查询性能
 */
export class ConversationStore {
  /**
   * 创建新对话
   *
   * @param data - 对话创建数据
   * @returns Promise<RedisConversation> 创建的对话对象
   */
  static async create(
    data: CreateConversationData
  ): Promise<RedisConversation> {
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

      // 🚀 缓存新创建的对话
      cache.set(generateCacheKey.conversation(conversationId), conversation);

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
    // 🚀 先检查内存缓存
    const cacheKey = generateCacheKey.conversation(id);
    const cached = cache.get(cacheKey) as RedisConversation | null;
    if (cached) {
      return cached;
    }

    const redis = await getRedisConnection();

    try {
      const data = await redis.hgetall(generateRedisKey.conversation(id));

      if (!isValidRedisData(data) || Object.keys(data).length === 0) {
        return null;
      }

      const conversation: RedisConversation = {
        id: data.id as string,
        title: data.title as string,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      };

      // 🚀 缓存结果
      cache.set(cacheKey, conversation);

      return conversation;
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
              const conversation: RedisConversation = {
                id: data.id,
                title: data.title,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              };
              conversations.push(conversation);

              // 🚀 缓存对话
              cache.set(
                generateCacheKey.conversation(conversation.id),
                conversation
              );
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
    data: UpdateConversationData
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

      // 🚀 清除缓存
      cache.delete(generateCacheKey.conversation(id));

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
        // 同时清除消息缓存
        cache.delete(generateCacheKey.message(messageId));
      });

      // 3. 删除对话消息列表
      pipeline.del(generateRedisKey.conversationMessages(id));

      // 4. 删除对话详情
      pipeline.del(generateRedisKey.conversation(id));

      // 5. 从对话列表中移除
      pipeline.zrem("conversations", id);

      await pipeline.exec();

      // 🚀 清除对话缓存
      cache.delete(generateCacheKey.conversation(id));

      return true;
    } catch (error) {
      console.error(`❌ 删除对话失败 (${id}):`, error);
      return false;
    }
  }

  /**
   * 批量删除对话
   *
   * @param ids - 对话ID数组
   * @returns Promise<number> 成功删除的对话数量
   */
  static async deleteMany(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    let successCount = 0;

    try {
      // 逐个删除对话（因为每个对话可能有不同数量的消息）
      for (const id of ids) {
        const success = await ConversationStore.delete(id);
        if (success) {
          successCount++;
        }
      }

      console.log(
        `✅ 批量删除对话完成，成功删除 ${successCount}/${ids.length} 个对话`
      );
      return successCount;
    } catch (error) {
      console.error("❌ 批量删除对话失败:", error);
      return successCount;
    }
  }

  /**
   * 修复现有对话的排序问题
   * 根据对话的 updatedAt 时间重新设置排序分数
   */
  static async fixConversationSorting(): Promise<void> {
    const redis = await getRedisConnection();

    try {
      console.log("🔧 开始修复对话排序...");

      // 1. 获取所有对话
      const conversations = await ConversationStore.findMany();

      if (conversations.length === 0) {
        console.log("✅ 没有对话需要修复");
        return;
      }

      // 2. 重新设置每个对话的排序分数
      const pipeline = redis.pipeline();

      conversations.forEach((conversation) => {
        // 使用 updatedAt 的时间戳作为排序分数
        const timestamp = new Date(conversation.updatedAt).getTime();
        pipeline.zadd("conversations", timestamp, conversation.id);
      });

      await pipeline.exec();

      console.log(`✅ 已修复 ${conversations.length} 个对话的排序`);
    } catch (error) {
      console.error("❌ 修复对话排序失败:", error);
    }
  }

  /**
   * 获取对话统计信息
   *
   * @returns Promise<{ total: number; recentCount: number }>
   */
  static async getStats(): Promise<{ total: number; recentCount: number }> {
    try {
      const redis = await getRedisConnection();

      // 获取总对话数
      const total = await redis.zcard("conversations");

      // 获取最近24小时的对话数
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentCount = await redis.zcount(
        "conversations",
        oneDayAgo,
        "+inf"
      );

      return {
        total,
        recentCount,
      };
    } catch (error) {
      console.error("❌ 获取对话统计失败:", error);
      return { total: 0, recentCount: 0 };
    }
  }
}
