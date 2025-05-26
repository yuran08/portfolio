#!/usr/bin/env tsx

import { DataMigration } from "../lib/redis-store";
import { testRedisConnection, closeRedisConnection } from "../lib/redis";

async function migrateToRedis() {
  console.log("🚀 开始从 Prisma 迁移到 Redis...");

  try {
    // 测试 Redis 连接
    const isConnected = await testRedisConnection();
    if (!isConnected) {
      console.error("❌ Redis 连接失败，请确保 Redis 服务正在运行");
      process.exit(1);
    }

    // 询问用户是否要清空现有 Redis 数据
    console.log("⚠️  警告：此操作将清空现有的 Redis 数据");
    console.log("📋 开始迁移数据...");

    // 清空现有 Redis 数据
    await DataMigration.clearRedisData();

    // 执行迁移
    await DataMigration.migrateFromPrisma();

    console.log("🎉 迁移完成！");
    console.log("💡 提示：您现在可以更新应用代码来使用 Redis 存储");
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  } finally {
    // 关闭 Redis 连接
    await closeRedisConnection();
  }
}

// 运行迁移
migrateToRedis();
