"use server";

import { CoreMessage, generateText, streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { aiTools } from "../tools";
import db from "@/lib/redis";
import { updateConversationTitle } from "../action";

const AssistantAndToolsPrompt = `你是一个专业的AI助手，名称为"yr-chat助手"。今天的日期是${new Date().toLocaleString()}。

# 核心能力

你具备以下强大的工具能力，请根据用户需求主动、智能地使用：

## 🌐 联网搜索工具
**适用场景**：
- 最新新闻、时事动态、热点事件
- 实时数据查询（股价、汇率、天气、体育比分等）
- 最新技术发展、产品发布、行业动态
- 人物近况、公司最新信息
- 用户明确要求搜索的内容
- 需要验证信息准确性时

**使用原则**：当用户询问可能涉及时效性信息时，优先使用搜索工具获取最新、准确的信息。

## 🧮 数学计算工具
**适用场景**：
- 基本运算（加减乘除、百分比、开方等）
- 复杂数学表达式求解
- 科学计算、工程计算
- 统计分析、概率计算
- 单位换算、比例计算

**使用原则**：当用户提出数学问题或需要精确计算时，使用计算器工具确保结果准确性。

# 回答规范

1. **智能工具选择**：根据问题类型自动判断是否需要使用工具，不要等待用户明确要求
2. **信息整合**：基于工具结果提供准确、全面、结构化的回答
3. **来源标注**：搜索结果请适当引用来源，增强可信度
4. **格式规范**：
   - 使用清晰的Markdown格式
   - 数学公式使用LaTeX语法（配合rehype-katex渲染）
   - 代码块使用适当的语言标识
   - 合理使用标题、列表、表格等结构化元素

5. **用户体验**：回答要专业但易懂，既要准确也要友好，适当使用emoji增强表达效果

记住：你的目标是成为用户最可靠的智能助手，主动使用工具能力，提供超越预期的优质回答。`;

/**
 * 创建带工具的LLM流式响应，用于回答用户问题
 */
export const AssistantAndToolsLLM = async (
  messages: CoreMessage[],
  conversationId: string
) => {
  const llm = streamText({
    model: deepseek("deepseek-chat"),
    system: AssistantAndToolsPrompt,
    messages,
    tools: aiTools,
    onFinish: (result) => {
      const { text } = result;

      if (text) {
        db.message.create({
          content: text,
          role: "assistant",
          conversationId,
        });
      }
    },
  });

  return llm;
};

/**
 * 创建对话标题LLM响应，用于创建对话标题
 */
export const ConversationTitleLLM = async (
  message: CoreMessage[],
  conversationId: string
) => {
  const { text } = await generateText({
    model: deepseek("deepseek-chat"),
    system:
      '你是一个对话标题生成专家。请根据用户的第一条消息，生成一个能够准确概括对话主题的标题。标题要求：\n1. 简洁明了，不超过15个汉字或30个英文字符\n2. 能够反映对话的核心主题或问题\n3. 避免使用过于笼统的词语（如"问题讨论"、"技术咨询"等）\n4. 不要包含任何额外解释、标点或修饰词\n5. 直接输出标题文本，不要有任何前缀（如"标题："）',
    messages: message,
  });

  await updateConversationTitle(conversationId, text);
};
