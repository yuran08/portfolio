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
 * 初始化Redis模块
 * @returns Promise<boolean> 初始化是否成功
 */
export const initializeRedis = async (): Promise<boolean> => {
  try {
    const { testRedisConnection } = await import("./connection");
    return await testRedisConnection();
  } catch (error) {
    console.error("❌ Redis模块初始化失败:", error);
    return false;
  }
};

/**
 * 清理Redis模块资源
 * @returns Promise<void>
 */
export const cleanupRedis = async (): Promise<void> => {
  try {
    const { closeRedisConnection } = await import("./connection");
    const { globalCache } = await import("./cache");

    // 关闭连接
    await closeRedisConnection();

    // 清理缓存
    globalCache.destroy();

    console.log("✅ Redis模块资源清理完成");
  } catch (error) {
    console.error("❌ Redis模块资源清理失败:", error);
  }
};

/**
 * 获取Redis模块状态
 * @returns Promise<{ connection: boolean; cache: object; performance?: object }>
 */
export const getRedisModuleStatus = async () => {
  try {
    const { redisHealthCheck, redisPerformanceStats } = await import(
      "./connection"
    );
    const { cache } = await import("./cache");

    const [healthResult, performanceResult] = await Promise.all([
      redisHealthCheck(),
      redisPerformanceStats(),
    ]);

    return {
      connection: healthResult.healthy,
      connectionInfo: healthResult.info,
      cache: cache.getStats(),
      performance: performanceResult,
    };
  } catch (error) {
    console.error("❌ 获取Redis模块状态失败:", error);
    return {
      connection: false,
      cache: { size: 0, defaultTTL: 0 },
      performance: null,
    };
  }
};
