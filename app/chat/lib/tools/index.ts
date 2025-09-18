import { webSearchAITool } from "./web-search";

/**
 * AI 工具配置集合
 * 供 LLM 使用的所有工具
 */
export const aiTools = {
  web_search: webSearchAITool,
  // TODO: 在这里添加更多工具，例如：
  // weather: weatherAITool,
  // translator: translatorAITool,
} as const;
