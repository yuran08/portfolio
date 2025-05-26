import {
  ConversationStore,
  MessageStore,
  RedisMessage,
  RedisConversation,
} from "./redis-store";

// 适配器类型定义，与 Prisma 模型兼容
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

// Redis 到应用模型的转换函数
function redisMessageToMessage(redisMessage: RedisMessage): Message {
  return {
    id: redisMessage.id,
    role: redisMessage.role,
    content: redisMessage.content,
    createdAt: new Date(redisMessage.createdAt),
    updatedAt: new Date(redisMessage.updatedAt),
    conversationId: redisMessage.conversationId,
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

// Redis 存储适配器
export class RedisAdapter {
  // 消息相关操作
  static message = {
    async create(data: {
      content: string;
      role: "user" | "assistant";
      conversationId: string;
    }): Promise<Message> {
      const redisMessage = await MessageStore.create(data);
      return redisMessageToMessage(redisMessage);
    },

    async findById(id: string): Promise<Message | null> {
      const redisMessage = await MessageStore.findById(id);
      return redisMessage ? redisMessageToMessage(redisMessage) : null;
    },

    async findByConversationId(conversationId: string): Promise<Message[]> {
      const redisMessages =
        await MessageStore.findByConversationId(conversationId);
      return redisMessages.map(redisMessageToMessage);
    },

    async update(
      id: string,
      data: { content?: string }
    ): Promise<Message | null> {
      const redisMessage = await MessageStore.update(id, data);
      return redisMessage ? redisMessageToMessage(redisMessage) : null;
    },

    async delete(id: string): Promise<boolean> {
      return await MessageStore.delete(id);
    },
  };

  // 对话相关操作
  static conversation = {
    async create(data: { title: string }): Promise<Conversation> {
      const redisConversation = await ConversationStore.create(data);
      return redisConversationToConversation(redisConversation);
    },

    async findById(id: string): Promise<Conversation | null> {
      const redisConversation = await ConversationStore.findById(id);
      return redisConversation
        ? redisConversationToConversation(redisConversation)
        : null;
    },

    async findMany(): Promise<Conversation[]> {
      const redisConversations = await ConversationStore.findMany();
      return redisConversations.map(redisConversationToConversation);
    },

    async findManyWithMessages(): Promise<Conversation[]> {
      const conversations = await this.findMany();

      // 为每个对话加载消息
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
          const messages = await RedisAdapter.message.findByConversationId(
            conversation.id
          );
          return {
            ...conversation,
            messages,
          };
        })
      );

      return conversationsWithMessages;
    },

    async update(
      id: string,
      data: { title?: string }
    ): Promise<Conversation | null> {
      const redisConversation = await ConversationStore.update(id, data);
      return redisConversation
        ? redisConversationToConversation(redisConversation)
        : null;
    },

    async delete(id: string): Promise<boolean> {
      return await ConversationStore.delete(id);
    },
  };
}

// 导出默认实例，可以直接使用
export const db = {
  message: RedisAdapter.message,
  conversation: RedisAdapter.conversation,
};
