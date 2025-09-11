# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Development Commands

### Core Development
```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

### Database Operations
```bash
# Generate Prisma client
pnpm postinstall

# Open Prisma Studio
pnpm db:studio

# Push database schema
pnpm db:push
```

## 🏗️ Architecture Overview

This is a **Next.js 15** portfolio project with AI chat capabilities featuring:

### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI Integration**: DeepSeek Chat API via @ai-sdk
- **Database**: Redis (Upstash) with Prisma
- **Search**: Tavily Search API for web search

### Key Directories
- `app/` - Next.js App Router pages and layouts
  - `chat/` - AI chat functionality with tools
  - `(root)/` - Main portfolio pages
- `lib/` - Shared utilities and Redis client
- `components/` - Reusable UI components
- `prisma/` - Database schema and migrations

### AI Chat System

The AI chat system features intelligent tool calling with:

1. **Web Search Tool** (`app/chat/tools/web-search.ts`)
   - Uses Tavily Search API for real-time web searches
   - Supports multiple search parameters and filters
   - Automatic fallback handling and error recovery

2. **Calculator Tool** (`app/chat/tools/calculator.ts`)
   - Mathematical expression evaluation
   - Scientific calculations and unit conversions

3. **LLM Integration** (`app/chat/lib/llm.ts`)
   - DeepSeek Chat model integration
   - Stream text generation with tool calling
   - Conversation title generation

### Environment Variables Required
```env
# AI APIs
DEEPSEEK_API_KEY=your_deepseek_api_key
TAVILY_API_KEY=your_tavily_api_key

# Database
REDIS_URL=your_redis_url

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_auth_secret
```

## 🔧 Development Patterns

### Tool Calling Architecture
- Tools are defined in `app/chat/tools/` directory
- Each tool has a Zod schema for parameter validation
- Tools return structured results with render data
- Results are formatted to Markdown for display

### State Management
- Redis used for conversation and message storage
- Prisma client for database operations
- Server actions for data mutations

### Styling Approach
- TailwindCSS for utility-first styling
- Radix UI components for accessibility
- Dark/light theme support via next-themes

## 📋 Common Development Tasks

### Adding a New AI Tool
1. Create tool file in `app/chat/tools/`
2. Define Zod schema for parameters
3. Implement execute function with proper error handling
4. Add to `aiTools` export in `app/chat/tools/index.ts`
5. Add formatter function for result display

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `pnpm db:push` to apply changes
3. Regenerate Prisma client with `pnpm postinstall`

### Testing AI Features
- Ensure required API keys are set in environment
- Test tool calling with various query types
- Verify error handling and fallback behavior