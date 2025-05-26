import redis, { generateRedisKey, REDIS_KEYS } from "./redis";
import { v4 as uuidv4 } from "uuid";

// 数据类型定义
export interface RedisMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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

// 类型守卫函数
const isValidRedisData = (data: unknown): data is Record<string, unknown> => {
  return typeof data === "object" && data !== null && "id" in data;
};

// 消息操作
export class MessageStore {
  // 创建消息
  static async create(data: {
    content: string;
    role: "user" | "assistant";
    conversationId: string;
  }): Promise<RedisMessage> {
    const messageId = uuidv4();
    const now = new Date().toISOString();

    const message: RedisMessage = {
      id: messageId,
      role: data.role,
      content: data.content,
      conversationId: data.conversationId,
      createdAt: now,
      updatedAt: now,
    };

    // 存储消息
    await redis.hmset(generateRedisKey.message(messageId), message);

    // 将消息ID添加到对话的消息列表中（按时间顺序）
    await redis.zadd(
      generateRedisKey.conversationMessages(data.conversationId),
      Date.now(),
      messageId
    );

    return message;
  }

  // 根据ID获取消息
  static async findById(id: string): Promise<RedisMessage | null> {
    const messageData = await redis.hgetall(generateRedisKey.message(id));

    if (!messageData.id) {
      return null;
    }

    return messageData as unknown as RedisMessage;
  }

  // 获取对话的所有消息
  static async findByConversationId(
    conversationId: string
  ): Promise<RedisMessage[]> {
    // 获取消息ID列表（按时间顺序）
    const messageIds = await redis.zrange(
      generateRedisKey.conversationMessages(conversationId),
      0,
      -1
    );

    if (messageIds.length === 0) {
      return [];
    }

    // 批量获取消息详情
    const pipeline = redis.pipeline();
    messageIds.forEach((id: string) => {
      pipeline.hgetall(generateRedisKey.message(id));
    });

    const results = await pipeline.exec();

    return results
      ?.map(([err, data]) => {
        if (err || !data || !isValidRedisData(data)) return null;
        return data as unknown as RedisMessage;
      })
      .filter(Boolean) as RedisMessage[];
  }

  // 更新消息
  static async update(
    id: string,
    data: { content?: string }
  ): Promise<RedisMessage | null> {
    const existingMessage = await this.findById(id);
    if (!existingMessage) {
      return null;
    }

    const updatedMessage: RedisMessage = {
      ...existingMessage,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await redis.hmset(generateRedisKey.message(id), updatedMessage);

    return updatedMessage;
  }

  // 删除消息
  static async delete(id: string): Promise<boolean> {
    const message = await this.findById(id);
    if (!message) {
      return false;
    }

    // 从消息存储中删除
    await redis.del(generateRedisKey.message(id));

    // 从对话消息列表中删除
    await redis.zrem(
      generateRedisKey.conversationMessages(message.conversationId),
      id
    );

    return true;
  }
}

// 对话操作
export class ConversationStore {
  // 创建对话
  static async create(data: { title: string }): Promise<RedisConversation> {
    const conversationId = uuidv4();
    const now = new Date().toISOString();

    const conversation: RedisConversation = {
      id: conversationId,
      title: data.title,
      createdAt: now,
      updatedAt: now,
    };

    // 存储对话
    await redis.hmset(
      generateRedisKey.conversation(conversationId),
      conversation
    );

    // 添加到对话列表中（按创建时间排序）
    await redis.zadd(REDIS_KEYS.CONVERSATION_LIST, Date.now(), conversationId);

    return conversation;
  }

  // 根据ID获取对话
  static async findById(id: string): Promise<RedisConversation | null> {
    const conversationData = await redis.hgetall(
      generateRedisKey.conversation(id)
    );

    if (!conversationData.id) {
      return null;
    }

    return conversationData as unknown as RedisConversation;
  }

  // 获取所有对话（按创建时间倒序）
  static async findMany(): Promise<RedisConversation[]> {
    // 获取对话ID列表（按时间倒序）
    const conversationIds = await redis.zrevrange(
      REDIS_KEYS.CONVERSATION_LIST,
      0,
      -1
    );

    if (conversationIds.length === 0) {
      return [];
    }

    // 批量获取对话详情
    const pipeline = redis.pipeline();
    conversationIds.forEach((id: string) => {
      pipeline.hgetall(generateRedisKey.conversation(id));
    });

    const results = await pipeline.exec();

    return results
      ?.map(([err, data]) => {
        if (err || !data || !isValidRedisData(data)) return null;
        return data as unknown as RedisConversation;
      })
      .filter(Boolean) as RedisConversation[];
  }

  // 更新对话
  static async update(
    id: string,
    data: { title?: string }
  ): Promise<RedisConversation | null> {
    const existingConversation = await this.findById(id);
    if (!existingConversation) {
      return null;
    }

    const updatedConversation: RedisConversation = {
      ...existingConversation,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await redis.hmset(generateRedisKey.conversation(id), updatedConversation);

    return updatedConversation;
  }

  // 删除对话
  static async delete(id: string): Promise<boolean> {
    const conversation = await this.findById(id);
    if (!conversation) {
      return false;
    }

    // 获取并删除所有相关消息
    const messages = await MessageStore.findByConversationId(id);
    const pipeline = redis.pipeline();

    // 删除所有消息
    messages.forEach((message) => {
      pipeline.del(generateRedisKey.message(message.id));
    });

    // 删除对话消息列表
    pipeline.del(generateRedisKey.conversationMessages(id));

    // 删除对话本身
    pipeline.del(generateRedisKey.conversation(id));

    // 从对话列表中删除
    pipeline.zrem(REDIS_KEYS.CONVERSATION_LIST, id);

    await pipeline.exec();

    return true;
  }
}

// 数据迁移工具
export class DataMigration {
  // 从Prisma迁移到Redis
  static async migrateFromPrisma(): Promise<void> {
    try {
      // 这里需要导入Prisma客户端
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      console.log("🚀 开始数据迁移...");

      // 获取所有对话
      const conversations = await prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      console.log(`📊 找到 ${conversations.length} 个对话`);

      // 迁移每个对话
      for (const conversation of conversations) {
        // 创建对话
        const redisConversation: RedisConversation = {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        };

        await redis.hmset(
          generateRedisKey.conversation(conversation.id),
          redisConversation
        );

        await redis.zadd(
          REDIS_KEYS.CONVERSATION_LIST,
          conversation.createdAt.getTime(),
          conversation.id
        );

        // 迁移消息
        for (const message of conversation.messages) {
          const redisMessage: RedisMessage = {
            id: message.id.toString(),
            role: message.role as "user" | "assistant",
            content: message.content,
            conversationId: message.conversationId,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
          };

          await redis.hmset(
            generateRedisKey.message(redisMessage.id),
            redisMessage
          );

          await redis.zadd(
            generateRedisKey.conversationMessages(conversation.id),
            message.createdAt.getTime(),
            redisMessage.id
          );
        }

        console.log(
          `✅ 迁移对话: ${conversation.title} (${conversation.messages.length} 条消息)`
        );
      }

      await prisma.$disconnect();
      console.log("🎉 数据迁移完成！");
    } catch (error) {
      console.error("❌ 数据迁移失败:", error);
      throw error;
    }
  }

  // 清空Redis数据
  static async clearRedisData(): Promise<void> {
    try {
      console.log("🧹 清空Redis数据...");

      // 获取所有相关键
      const conversationKeys = await redis.keys(`${REDIS_KEYS.CONVERSATION}*`);
      const messageKeys = await redis.keys(`${REDIS_KEYS.MESSAGE}*`);
      const conversationMessageKeys = await redis.keys(
        `${REDIS_KEYS.CONVERSATION_MESSAGES}*`
      );

      const allKeys = [
        ...conversationKeys,
        ...messageKeys,
        ...conversationMessageKeys,
        REDIS_KEYS.CONVERSATION_LIST,
        REDIS_KEYS.MESSAGE_COUNTER,
      ];

      if (allKeys.length > 0) {
        await redis.del(...allKeys);
        console.log(`🗑️ 删除了 ${allKeys.length} 个Redis键`);
      }

      console.log("✅ Redis数据清空完成");
    } catch (error) {
      console.error("❌ 清空Redis数据失败:", error);
      throw error;
    }
  }
}
