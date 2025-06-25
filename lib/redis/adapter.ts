/**
 * Redis 适配器层
 *
 * 【架构说明】
 * 此适配器层提供了与 Prisma 兼容的接口，使得从 Prisma + PostgreSQL 迁移到 Redis 变得简单。
 *
 * 【连接池架构】
 * 1. **单例连接池**: 整个应用共享一个 Redis 连接池实例
 * 2. **连接复用**: 避免每次数据库操作都创建新连接
 * 3. **自动重连**: 内置错误恢复和重连机制
 * 4. **性能优化**: 使用 Pipeline 进行批量操作
 *
 * 【为什么需要连接池】
 * - **性能**: 连接创建/销毁开销大，复用连接可以大幅提升性能
 * - **资源管理**: 避免连接泄漏和过多连接导致的资源耗尽
 * - **稳定性**: 统一的连接管理和错误处理，提高系统稳定性
 * - **监控**: 集中的连接状态监控和管理
 */

import type { CoreMessage } from "ai";
import { MessageStore } from "./store/message";
import { ConversationStore } from "./store/conversation";
import type {
  RedisMessage,
  RedisConversation,
  CreateMessageData,
  CreateConversationData,
  UpdateMessageData,
  UpdateConversationData,
} from "./store/types";

// 类型定义 - 与 Prisma 兼容
export interface Message extends Omit<CoreMessage, "id"> {
  id: string;
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

// 数据转换函数：Redis 格式 → 应用格式
function redisMessageToMessage(redisMessage: RedisMessage): Message {
  return {
    id: redisMessage.id,
    role: redisMessage.role,
    content:
      typeof redisMessage.content === "number"
        ? String(redisMessage.content)
        : redisMessage.content,
    conversationId: redisMessage.conversationId,
    createdAt: new Date(redisMessage.createdAt),
    updatedAt: new Date(redisMessage.updatedAt),
  };
}

function redisConversationToConversation(
  redisConversation: RedisConversation
): Conversation {
  return {
    id: redisConversation.id,
    title: redisConversation.title,
    createdAt: new Date(redisConversation.createdAt),
    updatedAt: new Date(redisConversation.updatedAt),
  };
}

/**
 * Redis 适配器 - 提供类似 Prisma 的数据库操作接口
 *
 * 【设计原则】
 * 1. **接口兼容**: 与 Prisma 客户端接口保持一致，便于迁移
 * 2. **错误处理**: 统一的错误处理和日志记录
 * 3. **类型安全**: 完整的 TypeScript 类型定义
 * 4. **性能优化**: 利用 Redis 的特性进行性能优化
 */
export class RedisAdapter {
  /**
   * 消息操作接口
   *
   * 【连接池使用】
   * 每个操作都通过连接池获取 Redis 连接，确保：
   * - 连接复用，避免频繁创建/销毁连接
   * - 自动错误恢复和重连
   * - 统一的连接配置和监控
   */
  static message = {
    /**
     * 创建新消息
     *
     * @param data - 消息创建数据
     * @returns Promise<Message> 创建的消息对象
     */
    async create(data: {
      content: Message["content"];
      role: "user" | "assistant" | "tool";
      conversationId: string;
    }): Promise<Message> {
      const createData: CreateMessageData = {
        content: data.content,
        role: data.role,
        conversationId: data.conversationId,
      };
      const redisMessage = await MessageStore.create(createData);
      return redisMessageToMessage(redisMessage);
    },

    /**
     * 根据 ID 查找消息
     *
     * @param id - 消息 ID
     * @returns Promise<Message | null> 消息对象或 null
     */
    async findById(id: string): Promise<Message | null> {
      const redisMessage = await MessageStore.findById(id);
      return redisMessage ? redisMessageToMessage(redisMessage) : null;
    },

    /**
     * 根据对话 ID 查找所有消息
     *
     * @param conversationId - 对话 ID
     * @returns Promise<Message[]> 消息列表
     */
    async findByConversationId(conversationId: string): Promise<Message[]> {
      const redisMessages =
        await MessageStore.findByConversationId(conversationId);
      return redisMessages.map(redisMessageToMessage);
    },

    /**
     * 更新消息
     *
     * @param id - 消息 ID
     * @param data - 更新数据
     * @returns Promise<Message | null> 更新后的消息对象
     */
    async update(
      id: string,
      data: { content?: Message["content"] }
    ): Promise<Message | null> {
      const updateData: UpdateMessageData = {
        content: data.content,
      };
      const redisMessage = await MessageStore.update(id, updateData);
      return redisMessage ? redisMessageToMessage(redisMessage) : null;
    },

    /**
     * 删除消息
     *
     * @param id - 消息 ID
     * @returns Promise<boolean> 删除是否成功
     */
    async delete(id: string): Promise<boolean> {
      return await MessageStore.delete(id);
    },

    /**
     * 批量删除消息
     *
     * @param ids - 消息ID数组
     * @returns Promise<number> 成功删除的数量
     */
    async deleteMany(ids: string[]): Promise<number> {
      return await MessageStore.deleteMany(ids);
    },

    /**
     * 获取消息统计信息
     *
     * @param conversationId - 对话ID（可选）
     * @returns Promise<{ total: number; byRole: Record<string, number> }>
     */
    async getStats(conversationId?: string): Promise<{
      total: number;
      byRole: Record<string, number>;
    }> {
      return await MessageStore.getStats(conversationId);
    },
  };

  /**
   * 对话操作接口
   *
   * 【连接池优势体现】
   * 对话操作通常涉及多个 Redis 命令（如创建对话 + 更新索引），
   * 连接池确保这些操作使用同一个连接，提高效率和一致性。
   */
  static conversation = {
    /**
     * 创建新对话
     *
     * @param data - 对话创建数据
     * @returns Promise<Conversation> 创建的对话对象
     */
    async create(data: { title: string; id?: string }): Promise<Conversation> {
      const createData: CreateConversationData & { id?: string } = {
        title: data.title,
        id: data.id,
      };
      const redisConversation = await ConversationStore.create(createData);
      return redisConversationToConversation(redisConversation);
    },

    /**
     * 根据 ID 查找对话
     *
     * @param id - 对话 ID
     * @returns Promise<Conversation | null> 对话对象或 null
     */
    async findById(id: string): Promise<Conversation | null> {
      const redisConversation = await ConversationStore.findById(id);
      return redisConversation
        ? redisConversationToConversation(redisConversation)
        : null;
    },

    /**
     * 获取所有对话
     *
     * @returns Promise<Conversation[]> 对话列表（按更新时间倒序）
     */
    async findMany(): Promise<Conversation[]> {
      const redisConversations = await ConversationStore.findMany();
      return redisConversations.map(redisConversationToConversation);
    },

    /**
     * 获取包含消息的对话列表
     *
     * 【性能考虑】
     * 由于消息数据可能很大，这里只返回对话基本信息。
     * 消息数据通过 message.findByConversationId 按需加载。
     *
     * @returns Promise<Conversation[]> 对话列表
     */
    async findManyWithMessages(): Promise<Conversation[]> {
      const redisConversations = await ConversationStore.findManyWithMessages();

      // 可以在这里添加消息预加载逻辑，但通常建议按需加载
      const conversationsWithMessages = await Promise.all(
        redisConversations.map(async (redisConversation) => {
          const conversation =
            redisConversationToConversation(redisConversation);

          // 这里可以选择是否预加载消息
          // conversation.messages = await this.message.findByConversationId(conversation.id);

          return conversation;
        })
      );

      return conversationsWithMessages;
    },

    /**
     * 更新对话
     *
     * @param id - 对话 ID
     * @param data - 更新数据
     * @returns Promise<Conversation | null> 更新后的对话对象
     */
    async update(
      id: string,
      data: { title?: string }
    ): Promise<Conversation | null> {
      const updateData: UpdateConversationData = {
        title: data.title,
      };
      const redisConversation = await ConversationStore.update(id, updateData);
      return redisConversation
        ? redisConversationToConversation(redisConversation)
        : null;
    },

    /**
     * 删除对话
     *
     * 【事务性操作】
     * 删除对话涉及多个操作：删除对话本身、删除所有相关消息、更新索引。
     * 连接池确保这些操作在同一个连接上执行，保证数据一致性。
     *
     * @param id - 对话 ID
     * @returns Promise<boolean> 删除是否成功
     */
    async delete(id: string): Promise<boolean> {
      return await ConversationStore.delete(id);
    },

    /**
     * 批量删除对话
     *
     * @param ids - 对话ID数组
     * @returns Promise<number> 成功删除的数量
     */
    async deleteMany(ids: string[]): Promise<number> {
      return await ConversationStore.deleteMany(ids);
    },

    /**
     * 获取对话统计信息
     *
     * @returns Promise<{ total: number; recentCount: number }>
     */
    async getStats(): Promise<{ total: number; recentCount: number }> {
      return await ConversationStore.getStats();
    },
  };
}

/**
 * 默认导出的数据库实例
 *
 * 【使用方式】
 * ```typescript
 * import db from '@/lib/redis';
 *
 * // 创建消息
 * const message = await db.message.create({
 *   content: 'Hello',
 *   role: 'user',
 *   conversationId: 'conv-123'
 * });
 *
 * // 获取对话列表
 * const conversations = await db.conversation.findMany();
 * ```
 *
 * 【连接池透明化】
 * 应用代码无需关心连接池的细节，所有连接管理都在底层自动处理。
 * 这提供了：
 * - 简洁的API接口
 * - 自动的资源管理
 * - 透明的性能优化
 */
export const db = RedisAdapter;
