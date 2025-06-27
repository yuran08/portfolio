/**
 * Redis 连接池管理器
 *
 * 提供高效、可靠的Redis连接管理功能
 */

import { Redis, RedisOptions } from "ioredis";

// 🚀 全局变量持久化 - 避免Next.js热重载时重新初始化
const globalForRedis = global as unknown as {
  redisConnectionPool: RedisConnectionPool;
};

/**
 * Redis 连接池管理器
 *
 * 【设计原理】
 * 1. **单例模式**: 确保整个应用只有一个连接池实例
 * 2. **连接复用**: 避免每次请求创建新连接，提高性能
 * 3. **优雅关闭**: 提供连接池关闭方法，支持应用优雅退出
 * 4. **错误恢复**: 内置重连机制和错误处理
 * 5. **🚀 热重载兼容**: 使用全局变量避免开发环境重复初始化
 *
 * 【连接池优势】
 * - 减少连接创建/销毁开销
 * - 避免连接数过多导致 Redis 服务器压力
 * - 提供连接状态监控和管理
 * - 支持自动重连和故障恢复
 * - 🚀 开发环境性能优化：避免热重载导致的重复连接
 */
class RedisConnectionPool {
  // 单例模式实例
  private static instance: RedisConnectionPool;

  // Redis 客户端实例
  private client: Redis | null = null;

  // 连接创建中的 Promise
  private connectingPromise: Promise<Redis> | null = null;

  // 连接状态
  private isConnected: boolean = false;

  /**
   * 私有构造函数，防止外部实例化
   */
  private constructor() {}

  /**
   * 获取 RedisConnectionPool 单例实例
   */
  public static getInstance(): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool();
    }
    return RedisConnectionPool.instance;
  }

  /**
   * 获取 Redis 连接
   * 异步模式：不阻塞调用方，连接将在后台初始化
   */
  public async getConnection(): Promise<Redis> {
    // 已连接，直接返回
    if (this.client && this.isConnected) {
      return this.client;
    }

    // 连接创建中，等待已存在的 Promise
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // 创建新的连接 Promise
    this.connectingPromise = this.createConnection();

    try {
      // 等待连接建立
      const client = await this.connectingPromise;
      return client;
    } catch (error) {
      // 连接失败，清空 Promise 以便于重试
      this.connectingPromise = null;
      throw error;
    }
  }

  /**
   * 创建新的 Redis 连接
   * 返回 Promise，以支持异步连接
   */
  private async createConnection(): Promise<Redis> {
    try {
      // 检查是否已有连接
      if (this.client && this.isConnected) {
        return this.client;
      }

      // 创建 Redis 客户端
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        throw new Error("缺少 REDIS_URL 环境变量");
      }

      const options: RedisOptions = {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        enableReadyCheck: true,
        autoResubscribe: true,
      };

      // 创建客户端
      this.client = new Redis(redisUrl, options);

      // 设置事件监听器
      this.setupEventListeners();

      // 返回客户端，不等待连接完成
      return this.client;
    } catch (error) {
      console.error("Redis 连接初始化失败:", error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      console.log("✅ Redis 连接已建立");
    });

    this.client.on("ready", () => {
      this.isConnected = true;
      console.log("✅ Redis 连接就绪");
    });

    this.client.on("error", (error) => {
      console.error("❌ Redis 连接错误:", error);
    });

    this.client.on("close", () => {
      this.isConnected = false;
      console.log("⚠️ Redis 连接已关闭");
    });

    this.client.on("reconnecting", () => {
      console.log("⏳ Redis 正在重新连接...");
    });
  }

  /**
   * 检查连接状态
   */
  public isConnectionReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * 获取连接统计信息
   *
   * @returns 连接统计对象
   */
  public getConnectionStats() {
    return {
      isConnected: this.isConnected,
      hasClient: this.client !== null,
      clientStatus: this.client?.status || "未连接",
    };
  }

  /**
   * 🚀 健康检查方法
   *
   * @returns Promise<boolean> 连接是否健康
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }

      // 执行 PING 命令测试连接
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("❌ Redis 健康检查失败:", error);
      return false;
    }
  }

  /**
   * 🚀 获取Redis服务器信息
   *
   * @returns Promise<Record<string, string> | null> Redis服务器信息
   */
  public async getServerInfo(): Promise<Record<string, string> | null> {
    try {
      if (!this.client || !this.isConnected) {
        return null;
      }

      const info = await this.client.info();
      const infoLines = info.split("\r\n");
      const infoObj: Record<string, string> = {};

      infoLines.forEach((line) => {
        if (line && !line.startsWith("#") && line.includes(":")) {
          const [key, value] = line.split(":");
          infoObj[key] = value;
        }
      });

      return infoObj;
    } catch (error) {
      console.error("❌ 获取Redis服务器信息失败:", error);
      return null;
    }
  }

  /**
   * 优雅关闭连接池
   *
   * 【关闭流程】
   * 1. 标记连接为不可用
   * 2. 等待正在执行的命令完成
   * 3. 关闭 Redis 连接
   * 4. 清理单例实例
   *
   * @param timeout - 关闭超时时间（毫秒），默认 5000ms
   * @returns Promise<void>
   */
  public async close(timeout: number = 5000): Promise<void> {
    if (!this.client) {
      console.log("📝 Redis 连接池已关闭");
      return;
    }

    try {
      console.log("🔄 正在关闭 Redis 连接池...");

      // 标记为未连接状态
      this.isConnected = false;

      // 等待连接关闭，设置超时
      await Promise.race([
        this.client.quit(), // 优雅关闭
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("关闭超时")), timeout)
        ),
      ]);

      console.log("✅ Redis 连接池已优雅关闭");
    } catch (error) {
      console.warn("⚠️ 优雅关闭失败，强制断开连接:", error);

      // 强制断开连接
      this.client?.disconnect();
    } finally {
      // 清理资源
      this.client = null;

      // 🚀 清理全局缓存 (仅开发环境)
      if (
        process.env.NODE_ENV !== "production" &&
        globalForRedis.redisConnectionPool === this
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globalForRedis.redisConnectionPool = null as any;
      }
    }
  }

  /**
   * 重置连接池（用于测试或故障恢复）
   *
   * @returns Promise<void>
   */
  public async reset(): Promise<void> {
    console.log("🔄 重置 Redis 连接池...");

    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }

    this.isConnected = false;

    // 重新获取连接
    await this.getConnection();

    console.log("✅ Redis 连接池重置完成");
  }
}

/**
 * 获取 Redis 连接
 *
 * 对外暴露的异步获取连接函数，不阻塞渲染
 */
export const getRedisConnection = async (): Promise<Redis> => {
  return RedisConnectionPool.getInstance().getConnection();
};

/**
 * 测试 Redis 连接
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const redis = await getRedisConnection();
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 关闭 Redis 连接池
 *
 * 应该在应用程序关闭时调用，确保资源正确释放
 *
 * @param timeout - 关闭超时时间（毫秒）
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * // 在应用程序关闭时
 * process.on('SIGTERM', async () => {
 *   await closeRedisConnection();
 *   process.exit(0);
 * });
 * ```
 */
export const closeRedisConnection = async (timeout?: number): Promise<void> => {
  const pool = RedisConnectionPool.getInstance();
  await pool.close(timeout);
};

/**
 * 获取 Redis 连接统计信息
 * @returns 连接池统计信息
 */
export const getRedisConnectionStats = () => {
  return RedisConnectionPool.getInstance().getConnectionStats();
};

/**
 * 重置 Redis 连接池
 * 用于开发环境或者连接出现问题时
 * @returns Promise<void>
 */
export const resetRedisConnection = async (): Promise<void> => {
  return RedisConnectionPool.getInstance().reset();
};

/**
 * 🚀 Redis健康检查工具
 * @returns Promise<{ healthy: boolean; info?: Record<string, string>; error?: string }>
 */
export const redisHealthCheck = async (): Promise<{
  healthy: boolean;
  info?: Record<string, string>;
  error?: string;
}> => {
  try {
    const pool = RedisConnectionPool.getInstance();
    const healthy = await pool.healthCheck();

    if (healthy) {
      const info = await pool.getServerInfo();
      return { healthy: true, info: info || undefined };
    } else {
      return { healthy: false, error: "连接不健康" };
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
};

/**
 * 🚀 Redis性能监控工具
 * @returns Promise<{ memoryUsage: string; commandsProcessed: string; connectedClients: string }>
 */
export const redisPerformanceStats = async (): Promise<{
  memoryUsage?: string;
  commandsProcessed?: string;
  connectedClients?: string;
  uptime?: string;
} | null> => {
  try {
    const pool = RedisConnectionPool.getInstance();
    const info = await pool.getServerInfo();

    if (!info) return null;

    return {
      memoryUsage: info.used_memory_human,
      commandsProcessed: info.total_commands_processed,
      connectedClients: info.connected_clients,
      uptime: info.uptime_in_seconds
        ? `${Math.floor(Number(info.uptime_in_seconds) / 3600)}小时`
        : undefined,
    };
  } catch (error) {
    console.error("❌ 获取Redis性能统计失败:", error);
    return null;
  }
};

// 导出默认连接获取函数，保持向后兼容
export default getRedisConnection;
