import { Redis, RedisOptions } from "ioredis";

/**
 * Redis 连接池管理器
 *
 * 【设计原理】
 * 1. **单例模式**: 确保整个应用只有一个连接池实例
 * 2. **连接复用**: 避免每次请求创建新连接，提高性能
 * 3. **优雅关闭**: 提供连接池关闭方法，支持应用优雅退出
 * 4. **错误恢复**: 内置重连机制和错误处理
 *
 * 【连接池优势】
 * - 减少连接创建/销毁开销
 * - 避免连接数过多导致 Redis 服务器压力
 * - 提供连接状态监控和管理
 * - 支持自动重连和故障恢复
 */
class RedisConnectionPool {
  /**
   * 单例实例
   * @private
   */
  private static instance: RedisConnectionPool | null = null;

  /**
   * Redis 客户端实例
   * ioredis 本身就是连接池，单个实例内部管理多个连接
   * @private
   */
  private client: Redis | null = null;

  /**
   * 连接状态标识
   * @private
   */
  private isConnected: boolean = false;

  /**
   * 私有构造函数，防止外部直接实例化
   * @private
   */
  private constructor() {
    // 构造函数为空，连接在 getConnection 时创建
  }

  /**
   * 获取连接池单例实例
   *
   * @returns Redis 连接池实例
   *
   * @example
   * ```typescript
   * const pool = RedisConnectionPool.getInstance();
   * const client = await pool.getConnection();
   * ```
   */
  public static getInstance(): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool();
      console.log("🏊 Redis 连接池初始化");
    }

    return RedisConnectionPool.instance;
  }

  /**
   * 获取 Redis 连接
   *
   * 【工作原理】
   * 1. 检查现有连接是否可用
   * 2. 如果没有连接，创建新的连接
   * 3. 设置连接事件监听器
   * 4. 返回可用的连接实例
   *
   * @returns Promise<Redis> Redis 客户端实例
   * @throws 连接失败时抛出错误
   */
  public async getConnection(): Promise<Redis> {
    // 如果已有连接且状态正常，直接返回
    if (this.client && this.isConnected) {
      return this.client;
    }

    // 创建新连接
    if (!this.client) {
      // 配置连接选项
      const options: RedisOptions = {
        // 连接池配置
        maxRetriesPerRequest: 3,
        lazyConnect: true, // 延迟连接，只有在首次使用时才建立连接
        family: 4, // IPv4
        keepAlive: 30000, // 保持连接活跃 (30秒)

        // 重连策略：指数退避算法
        retryStrategy: (times: number): number => {
          const delay = Math.min(times * 50, 2000);
          console.log(`🔄 Redis 重连尝试 #${times}, 延迟 ${delay}ms`);
          return delay;
        },

        // 基于错误类型的重连策略
        reconnectOnError: (err: Error): boolean => {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            console.log("🔄 检测到 READONLY 错误，触发重连");
            return true;
          }
          return false;
        },
      };

      // 创建 Redis 客户端实例
      if (process.env.REDIS_URL) {
        // 使用 Redis URL
        this.client = new Redis(process.env.REDIS_URL, options);
      } else {
        // 使用默认本地配置
        this.client = new Redis({
          ...options,
          host: "localhost",
          port: 6379,
          db: 0,
        });
      }

      this.setupEventListeners();
    }

    // 确保连接已建立
    if (!this.isConnected) {
      try {
        await this.client.ping();
        this.isConnected = true;
      } catch (error) {
        console.error("❌ Redis 连接失败:", error);
        throw new Error(
          `Redis 连接失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    }

    return this.client;
  }

  /**
   * 设置连接事件监听器
   *
   * 【监听的事件】
   * - connect: 连接建立
   * - ready: 连接就绪（可以接收命令）
   * - error: 连接错误
   * - close: 连接关闭
   * - reconnecting: 重连中
   * - end: 连接结束
   *
   * @private
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // 连接建立事件
    this.client.on("connect", () => {
      // 连接建立时的静默日志
    });

    // 连接就绪事件（可以开始发送命令）
    this.client.on("ready", () => {
      this.isConnected = true;
    });

    // 连接错误事件
    this.client.on("error", (error) => {
      this.isConnected = false;
      console.error("❌ Redis 连接错误:", error.message);

      // 可以在这里添加错误报告逻辑
      // 例如：发送到监控系统、记录日志等
    });

    // 连接关闭事件
    this.client.on("close", () => {
      this.isConnected = false;
      console.log("🔌 Redis 连接已关闭");
    });

    // 重连事件
    this.client.on("reconnecting", (ms: number) => {
      this.isConnected = false;
      console.log(`🔄 Redis 正在重连... (${ms}ms 后重试)`);
    });

    // 连接结束事件
    this.client.on("end", () => {
      this.isConnected = false;
      console.log("🔚 Redis 连接已结束");
    });
  }

  /**
   * 获取连接状态
   *
   * @returns boolean 连接是否处于活跃状态
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
      clientStatus: this.client?.status || "none",
      // 可以添加更多统计信息，如命令计数、错误率等
    };
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
      RedisConnectionPool.instance = null;
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
 * 获取 Redis 连接的便捷函数
 *
 * 这是应用程序的主要入口点，其他模块通过此函数获取 Redis 连接
 *
 * @returns Promise<Redis> Redis 客户端实例
 *
 * @example
 * ```typescript
 * import { getRedisConnection } from '@/lib/redis';
 *
 * const redis = await getRedisConnection();
 * await redis.set('key', 'value');
 * const value = await redis.get('key');
 * ```
 */
export const getRedisConnection = async (): Promise<Redis> => {
  const pool = RedisConnectionPool.getInstance();
  return await pool.getConnection();
};

/**
 * 测试 Redis 连接
 *
 * @returns Promise<boolean> 连接测试结果
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const redis = await getRedisConnection();
    const result = await redis.ping();

    if (result === "PONG") {
      console.log("✅ Redis 连接测试成功");
      return true;
    } else {
      console.error("❌ Redis ping 响应异常:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Redis 连接测试失败:", error);
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
 * 获取连接池状态信息
 *
 * @returns 连接池状态对象
 */
export const getRedisConnectionStats = () => {
  const pool = RedisConnectionPool.getInstance();
  return pool.getConnectionStats();
};

/**
 * 重置连接池（主要用于开发和测试）
 *
 * @returns Promise<void>
 */
export const resetRedisConnection = async (): Promise<void> => {
  const pool = RedisConnectionPool.getInstance();
  await pool.reset();
};

// 导出默认连接获取函数，保持向后兼容
export default getRedisConnection;

// Redis键前缀
export const REDIS_KEYS = {
  CONVERSATION: "conversation:",
  MESSAGE: "message:",
  CONVERSATION_MESSAGES: "conversation_messages:",
  CONVERSATION_LIST: "conversations",
  MESSAGE_COUNTER: "message_counter",
} as const;

// 工具函数：生成Redis键
export const generateRedisKey = {
  conversation: (id: string) => `${REDIS_KEYS.CONVERSATION}${id}`,
  message: (id: string) => `${REDIS_KEYS.MESSAGE}${id}`,
  conversationMessages: (conversationId: string) =>
    `${REDIS_KEYS.CONVERSATION_MESSAGES}${conversationId}`,
};
