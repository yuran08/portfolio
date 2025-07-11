/**
 * Redis 模块统一导出
 *
 * 提供所有Redis相关功能的统一入口
 */

// 连接管理
export {
  getRedisConnection,
  testRedisConnection,
  closeRedisConnection,
  resetRedisConnection,
  getRedisConnectionStats,
  redisHealthCheck,
  redisPerformanceStats,
} from "./connection";

// 缓存管理
export { MemoryCache, globalCache, cache } from "./cache";

// 数据压缩
export {
  DataCompressor,
  compress,
  decompress,
  isCompressed,
  isRaw,
  getFormat,
} from "./compression";

// 键管理
export { REDIS_KEYS, generateRedisKey, generateCacheKey } from "./keys";

// 存储类型
export type {
  RedisMessage,
  RedisConversation,
  CreateMessageData,
  UpdateMessageData,
  CreateConversationData,
  UpdateConversationData,
  RedisOperationResult,
  BatchOperationResult,
  StorageStats,
} from "./store/types";

export { isValidRedisData } from "./store/types";

// 存储类
export { MessageStore } from "./store/message";
export { ConversationStore } from "./store/conversation";

// 适配器
export { RedisAdapter, db, type Message, type Conversation } from "./adapter";

// 默认导出数据库实例（向后兼容）
export { db as default } from "./adapter";

/**
 * 便捷的工具函数
 */

/**
 * Redis 连接池预热
 * 但不等待连接完成，不阻塞渲染过程
 */
const warmupRedisPool = () => {
  // 使用setTimeout延迟加载Redis连接
  setTimeout(async () => {
    try {
      // 动态导入连接模块
      const { getRedisConnection } = await import("./connection");

      // 触发Redis连接初始化，但不等待它完成
      getRedisConnection()
        .then((redis) => {
          // 成功则执行ping操作保持连接
          return redis.ping();
        })
        .catch((err) => {
          console.error("Redis预热连接失败:", err);
        });
    } catch (error) {
      console.error("Redis连接模块导入失败:", error);
    }
  }, 100); // 小延迟，确保不阻塞渲染
};

// 自动预热连接池
warmupRedisPool();

/**
 * 初始化Redis模块
 * 此函数可以在应用启动时显式调用，但并不是必须的
 */
export const initializeRedis = async (): Promise<boolean> => {
  try {
    // 动态导入连接模块
    const { testRedisConnection } = await import("./connection");

    // 测试连接，但不阻塞调用方
    const isConnected = await testRedisConnection();

    return isConnected;
  } catch (error) {
    console.error("Redis初始化失败:", error);
    return false;
  }
};

/**
 * 清理Redis资源
 * 在应用关闭时调用，确保资源正确释放
 */
export const cleanupRedis = async (): Promise<void> => {
  try {
    // 动态导入连接模块
    const { closeRedisConnection } = await import("./connection");

    // 关闭连接
    await closeRedisConnection();
  } catch (error) {
    console.error("Redis清理失败:", error);
  }
};

/**
 * 获取Redis模块状态
 */
export const getRedisModuleStatus = async () => {
  try {
    // 动态导入连接模块
    const { getRedisConnectionStats, redisHealthCheck } = await import(
      "./connection"
    );

    const connectionStats = getRedisConnectionStats();
    const health = await redisHealthCheck();

    return {
      isActive: health.healthy,
      connectionStats,
      health,
    };
  } catch (error) {
    return {
      isActive: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
};
