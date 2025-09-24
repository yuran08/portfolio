import { aiTools } from "@/app/chat/lib/tools";
import { deepseek } from "@ai-sdk/deepseek";
import { stepCountIs, type streamText } from "ai";

export type ModelConfig = Partial<Parameters<typeof streamText>[0]>;

const baseSystemPrompt =
  "你是一个专业、准确、有帮助的人工智能助手。请遵循以下指导原则：\n\n" +
  "1. 准确性优先：提供准确可靠的信息，如果对某些细节不确定，请明确说明\n" +
  "2. 全面回答：对用户的问题提供完整、详细的答复，涵盖相关方面\n" +
  "3. 结构清晰：使用清晰的逻辑结构组织回答，但避免使用Markdown格式\n" +
  "4. 中文优先：优先使用中文进行回答，除非用户明确要求其他语言\n" +
  "5. 专业友好：保持专业且友好的语气，适应用户的知识水平\n" +
  "6. 诚实透明：承认知识的局限性，不编造不确定的信息\n\n" +
  "核心能力要求：\n" +
  "- 信息检索与整合：能够从知识库中提取和整合相关信息\n" +
  "- 逻辑推理：进行合理的逻辑分析和推理\n" +
  "- 问题解决：提供实用的解决方案和建议\n" +
  "- 沟通表达：使用清晰、易懂的语言进行沟通";

const userPrompt = `\n\n 用户当前时间为${new Date()}`;

export function getModelConfig(
  reasonerModel: boolean,
  searchMode: boolean
): Required<
  Pick<ModelConfig, "model" | "system" | "temperature" | "stopWhen">
> &
  Partial<Pick<ModelConfig, "tools">> {
  let systemPrompt = baseSystemPrompt + userPrompt;
  const stopWhen = stepCountIs(5);
  let tools = {};

  if (searchMode) {
    systemPrompt +=
      "\n\n网络搜索工具已启用。当用户的问题涉及以下情况时，请使用网络搜索工具：\n" +
      "- 实时信息：新闻、最新事件、当前统计数据\n" +
      "- 特定查询：需要从互联网获取的具体信息或数据\n" +
      "- 验证确认：需要确认某些事实、数据或信息的准确性\n" +
      "- 专业知识：超出你知识范围的特定领域专业问题\n" +
      "使用搜索工具前，请先分析用户问题的关键词和搜索意图，确保搜索查询的相关性和有效性。";
    tools = {
      web_search: aiTools.web_search,
    };
  }

  if (reasonerModel) {
    systemPrompt +=
      "\n\n推理模式已启用。请展示完整的思考过程：\n" +
      "- 逐步分析：将复杂问题分解为可管理的步骤\n" +
      "- 逻辑推导：展示从前提条件到结论的逻辑链条\n" +
      "- 假设检验：考虑不同的可能性并进行验证\n" +
      "- 结论总结：在推理结束后提供清晰的结论\n" +
      "让用户能够跟随你的思考路径，理解问题解决的整个过程。";
  }

  return {
    model: deepseek(reasonerModel ? "deepseek-reasoner" : "deepseek-chat"),
    tools: searchMode ? tools : undefined,
    system: systemPrompt,
    temperature: 0.7,
    stopWhen,
  };
}
