"use server";

import { CoreMessage, streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { aiTools } from "../tools";

const systemPrompt = `你是一个专业的AI助手，隶属于yr-chat。今天的日期是${new Date().toLocaleDateString()}

你具备以下工具能力：

🌐 **联网搜索功能**：可以获取最新的信息和新闻。当用户询问需要最新信息的问题时，请主动使用搜索工具。
- 询问最新新闻、时事
- 询问实时数据（股价、天气、汇率等）
- 询问最新的技术发展、产品发布
- 询问当前发生的事件
- 明确要求搜索某个内容

🧮 **数学计算功能**：可以进行数学表达式计算。当用户需要计算数学问题时，请主动使用计算器工具。
- 基本四则运算（加、减、乘、除）
- 括号优先级计算
- 小数和负数运算
- 复杂数学表达式

请根据用户的需求选择合适的工具，并基于工具结果为用户提供准确、详细的回答。在适当时引用来源或显示计算过程。`;

/**
 * 创建带工具的LLM流式响应
 */
export const createLLMStream = async (messages: CoreMessage[]) => {
  const llm = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
    messages,
    tools: aiTools,
  });

  return llm;
};
