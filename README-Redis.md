# Redis 存储解决方案

## 🎯 项目概述

本项目实现了完整的 Redis 存储解决方案，用于替代传统的 Prisma + PostgreSQL 架构，提供更高性能的聊天应用数据存储。

## 🚀 主要特性

- ✅ **高性能**: Redis 内存存储，毫秒级响应
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **兼容性**: 与 Prisma 接口兼容，无缝迁移
- ✅ **批量优化**: 使用 Pipeline 优化批量操作
- ✅ **数据迁移**: 提供从 Prisma 到 Redis 的迁移工具
- ✅ **开发友好**: 丰富的测试和调试工具

## 📁 文件结构

```
lib/
├── redis.ts              # Redis 连接配置 (ioredis)
├── redis-store.ts        # 底层 Redis 存储操作
└── redis-adapter.ts      # Prisma 兼容的适配器接口

scripts/
├── test-redis-store.ts   # Redis 存储功能测试
└── migrate-to-redis.ts   # Prisma 到 Redis 迁移脚本

docs/
├── redis-setup.md        # Redis 安装和配置指南
└── redis-usage.md        # 详细使用文档
```

## 🛠️ 快速开始

### 1. 安装 Redis

```bash
# macOS
brew install redis
brew services start redis

# 或使用 Docker
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 2. 配置环境变量

在 `.env.local` 中添加：

```bash
REDIS_URL="redis://localhost:6379"
```

### 3. 测试连接

```bash
pnpm redis:test
```

### 4. 迁移数据（可选）

```bash
pnpm redis:migrate
```

## 💻 使用示例

```typescript
import { db } from "@/lib/redis-adapter";

// 创建对话和消息
const conversation = await db.conversation.create({
  title: "新对话"
});

const message = await db.message.create({
  content: "你好！",
  role: "user",
  conversationId: conversation.id
});

// 获取数据
const conversations = await db.conversation.findMany();
const messages = await db.message.findByConversationId(conversation.id);
```

## 🏗️ 架构设计

### 三层架构

1. **连接层** (`redis.ts`)
   - ioredis 客户端配置
   - 连接管理和错误处理
   - 键命名规范

2. **存储层** (`redis-store.ts`)
   - 底层 Redis 操作
   - 数据序列化/反序列化
   - Pipeline 批量优化

3. **适配器层** (`redis-adapter.ts`)
   - Prisma 兼容接口
   - 类型转换
   - 业务逻辑封装

### 数据结构

```
Redis 键结构:
├── conversation:{id}           # Hash - 对话数据
├── message:{id}               # Hash - 消息数据
├── conversation_messages:{id} # ZSet - 对话消息列表
└── conversations             # ZSet - 所有对话列表
```

## 📊 性能对比

| 指标 | Prisma + PostgreSQL | Redis |
|------|-------------------|-------|
| 读取延迟 | 10-50ms | < 1ms |
| 写入延迟 | 20-100ms | < 1ms |
| 并发支持 | 中等 | 高 |
| 内存使用 | 低 | 中等 |
| 数据持久化 | 强 | 可配置 |

## 🔧 可用脚本

```bash
# 测试 Redis 存储功能
pnpm redis:test

# 从 Prisma 迁移到 Redis
pnpm redis:migrate

# 启用调试模式
DEBUG=ioredis:* pnpm dev
```

## 📚 文档链接

- [Redis 安装配置](./docs/redis-setup.md)
- [详细使用指南](./docs/redis-usage.md)
- [API 参考文档](./docs/redis-usage.md#api-参考)

## 🔍 故障排除

### 常见问题

1. **Redis 连接失败**
   ```bash
   redis-cli ping  # 检查 Redis 是否运行
   ```

2. **环境变量未设置**
   ```bash
   echo $REDIS_URL  # 检查环境变量
   ```

3. **数据不一致**
   ```bash
   pnpm redis:test  # 重新测试和初始化
   ```

## 🚀 生产环境

### 推荐配置

- **内存**: 至少 2GB
- **持久化**: RDB + AOF
- **高可用**: Redis Sentinel
- **扩展**: Redis Cluster

### 监控指标

- 内存使用率
- 连接数
- 命令执行延迟
- 键空间命中率

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个 Redis 存储解决方案！

## �� 许可证

MIT License 