"use server";

import { CoreMessage, streamText, tool } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";
import { webSearchTool } from "./tools/web-search";

// 定义搜索工具的模式
const searchToolSchema = z.object({
  query: z.string().describe("要搜索的查询内容"),
  enhanced: z
    .boolean()
    .optional()
    .describe("是否启用增强搜索（获取完整网页内容）")
    .default(false),
});

const systemPrompt = `你是一个专业的AI助手，隶属于yr-chat。今天的日期是${new Date().toLocaleDateString()}

你有联网搜索功能，可以获取最新的信息和新闻。当用户询问需要最新信息的问题时，请主动使用搜索工具。

使用搜索工具的情况包括但不限于：
- 询问最新新闻、时事
- 询问实时数据（股价、天气、汇率等）
- 询问最新的技术发展、产品发布
- 询问当前发生的事件
- 明确要求搜索某个内容

请根据搜索结果为用户提供准确、详细的回答，并在适当时引用来源。`;

/**
 * 创建带工具的LLM流式响应
 */
export const createLLMStream = async (messages: CoreMessage[]) => {
  console.log(messages, "*createLLMStream messages*");
  const llm = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
    messages,
    tools: {
      web_search: tool({
        description: "搜索互联网获取最新信息和新闻",
        parameters: searchToolSchema,
        execute: async ({ query, enhanced = false }) => {
          console.log("🔍 AI调用搜索工具:", { query, enhanced });

          try {
            const result = await webSearchTool.execute({ query, enhanced });
            console.log("✅ 搜索工具执行成功:", {
              query: result.query,
              resultsCount: result.results.length,
            });

            return {
              success: true,
              query: result.query,
              results: result.results,
              timestamp: result.timestamp,
              summary: `找到 ${result.results.length} 个搜索结果`,
            };
          } catch (error) {
            console.error("❌ 搜索工具执行失败:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "搜索失败",
              query,
            };
          }
        },
      }),
    },
  });

  return llm;
};
