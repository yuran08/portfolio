# Portfolio Project

一个基于 Next.js 15 的现代化个人作品集和AI聊天系统，集成了联网搜索功能。

## 🚀 功能：AI 联网搜索

### 功能特性

🌐 **联网搜索**
- 使用多个搜索引擎（Bing、Startpage）
- 获取最新信息和新闻
- 支持网页内容提取
- 超时保护和错误处理

🔍 **智能搜索策略**
- 多搜索引擎回退机制
- 智能内容提取和清理
- 结果去重和格式化

### 使用方法

#### 1. 聊天界面搜索
在聊天输入框中，点击"搜索"按钮：
- 输入搜索内容
- 点击"搜索"按钮或按Enter键
- AI会自动进行联网搜索并回答

#### 2. 直接询问
直接向 AI 提问，当需要最新信息时，AI会自动触发搜索：

```
用户：最新的AI技术发展如何？
AI：我来为您搜索最新的AI技术信息...
```

```
用户：今天有什么重要新闻？
AI：让我搜索今天的重要新闻...
```

### 技术实现

#### AI工具调用架构

```typescript
// LLM配置与工具定义
import { createLLMStreamWithTools } from './llm';

// AI自动调用工具
const { textStream } = await createLLMStreamWithTools(messages);
```

#### 工具定义

```typescript
// 在 llm.ts 中定义搜索工具
tools: {
  web_search: tool({
    description: "搜索互联网获取最新信息和新闻",
    parameters: searchToolSchema,
    execute: async ({ query, enhanced = false }) => {
      const result = await webSearchTool.execute({ query, enhanced });
      return {
        success: true,
        query: result.query,
        results: result.results,
        timestamp: result.timestamp,
      };
    },
  }),
}
```

#### 搜索引擎支持

- **主要引擎**: Bing搜索
- **备用引擎**: Startpage搜索
- **回退机制**: 模拟搜索结果
- **超时保护**: 8-10秒超时

#### 搜索结果格式

```markdown
## 🌐 网络搜索结果

找到 5 个相关结果：

### 1. 标题
内容摘要...
🔗 [查看原文](链接)

<details>
<summary>查看完整内容</summary>
完整网页内容...
</details>
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **AI**: DeepSeek Chat API
- **数据库**: Redis (Upstash)
- **搜索**: Bing + Startpage
- **包管理**: pnpm

## 环境要求

- Node.js 18+
- pnpm 8+

## 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 环境变量

```env
# AI API
DEEPSEEK_API_KEY=your_deepseek_api_key

# Redis 数据库
REDIS_URL=your_redis_url

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_auth_secret
```

## 项目结构

```
portfolio/
├── app/                    # Next.js App Router
│   ├── chat/              # AI 聊天功能
│   │   ├── tools/         # 搜索工具
│   │   │   ├── web-search.ts      # 网络搜索实现
│   │   │   └── index.ts           # 工具管理器
│   │   ├── llm.ts         # AI模型配置与工具定义
│   │   ├── action.tsx     # 服务器操作
│   │   ├── search-button.tsx      # 搜索按钮组件
│   │   └── chat-input.tsx         # 聊天输入组件
│   └── (root)/            # 主页面
├── lib/                   # 工具库
├── components/            # 共享组件
└── public/               # 静态资源
```

## 搜索功能特点

### ✅ 优化的AI工具调用
- 使用AI SDK的原生tool calling功能
- AI自动判断何时需要搜索
- 智能工具参数解析和执行
- 多轮工具调用支持

### 🔧 强大的搜索引擎
- Check按钮样式，清晰的操作反馈
- 自动超时保护，避免长时间等待
- 多引擎回退（Bing + Startpage），保证搜索成功率
- 智能内容提取，提供高质量结果

### 🎨 用户界面
- 简洁的搜索按钮设计
- 响应式搜索面板
- 深色模式支持
- 直观的操作流程

## 使用技巧

### 1. 搜索最新信息
- ✅ `今天的科技新闻`
- ✅ `最新的AI发展`
- ✅ `2024年技术趋势`

### 2. 具体事件查询
- ✅ `OpenAI最新产品发布`
- ✅ `苹果新品发布会`
- ✅ `比特币价格走势`

### 3. 实时信息
- ✅ `当前天气`
- ✅ `股市行情`
- ✅ `汇率查询`

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License
