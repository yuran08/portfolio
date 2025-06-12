/**
 * 内存缓存管理器
 *
 * 提供高效的内存缓存功能，减少Redis访问次数
 */

interface CacheItem {
  data: unknown;
  expiry: number;
}

/**
 * 内存缓存管理器
 *
 * 【功能特性】
 * - 自动过期清理
 * - TTL（生存时间）控制
 * - 内存使用优化
 * - 线程安全操作
 */
export class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分钟缓存
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(defaultTTL = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
    this.startCleanupTask();
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 生存时间（毫秒），默认使用配置的TTL
   */
  set(key: string, value: unknown, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或null（如果不存在或已过期）
   */
  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      defaultTTL: this.defaultTTL,
    };
  }

  /**
   * 检查缓存项是否存在且未过期
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取所有未过期的键
   * @returns 键数组
   */
  keys(): string[] {
    const now = Date.now();
    const validKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiry) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }

    return validKeys;
  }

  /**
   * 启动清理任务
   * @private
   */
  private startCleanupTask(): void {
    // 每分钟清理一次过期缓存
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60 * 1000);
  }

  /**
   * 清理过期项
   * @private
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 缓存清理完成，清理了 ${cleanedCount} 个过期项`);
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * 全局缓存实例
 */
export const globalCache = new MemoryCache();

/**
 * 便捷的缓存操作接口
 */
export const cache = {
  set: globalCache.set.bind(globalCache),
  get: globalCache.get.bind(globalCache),
  delete: globalCache.delete.bind(globalCache),
  clear: globalCache.clear.bind(globalCache),
  has: globalCache.has.bind(globalCache),
  keys: globalCache.keys.bind(globalCache),
  getStats: globalCache.getStats.bind(globalCache),
};
