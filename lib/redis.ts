import Redis from "ioredis";

// 创建Redis实例
const redis = new Redis(process.env.REDIS_URL!);

// 连接事件监听
redis.on("connect", () => {
  console.log("✅ Redis连接成功");
});

redis.on("error", (error) => {
  console.error("❌ Redis连接错误:", error);
});

redis.on("close", () => {
  console.log("🔌 Redis连接已关闭");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis重新连接中...");
});

// Redis键前缀
export const REDIS_KEYS = {
  CONVERSATION: "conversation:",
  MESSAGE: "message:",
  CONVERSATION_MESSAGES: "conversation_messages:",
  CONVERSATION_LIST: "conversations",
  MESSAGE_COUNTER: "message_counter",
} as const;

// 导出Redis实例
export default redis;

// 工具函数：生成Redis键
export const generateRedisKey = {
  conversation: (id: string) => `${REDIS_KEYS.CONVERSATION}${id}`,
  message: (id: string) => `${REDIS_KEYS.MESSAGE}${id}`,
  conversationMessages: (conversationId: string) =>
    `${REDIS_KEYS.CONVERSATION_MESSAGES}${conversationId}`,
};

// 连接测试函数
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    console.log("✅ Redis连接测试成功");
    return true;
  } catch (error) {
    console.error("❌ Redis连接测试失败:", error);
    return false;
  }
};

// 优雅关闭Redis连接
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log("✅ Redis连接已优雅关闭");
  } catch (error) {
    console.error("❌ Redis关闭连接时出错:", error);
  }
};
