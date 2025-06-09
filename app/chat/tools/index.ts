import { webSearchAITool } from "./web-search";
import { calculatorAITool } from "./calculator";

/**
 * AI 工具配置集合
 * 供 LLM 使用的所有工具
 */
export const aiTools = {
  web_search: webSearchAITool,
  calculator: calculatorAITool,
  // 在这里添加更多工具，例如：
  // weather: weatherAITool,
  // translator: translatorAITool,
} as const;

// 导出工具类型和接口
export type { TavilySearchResponse, TavilySearchOptions } from "@tavily/core";
export type { calculatorToolSchema } from "./calculator";

// 导出格式化方法（从各工具文件中重新导出）
export { formatCalculationResultToMarkdown } from "./calculator";
export { formatSearchResultsToMarkdown } from "./web-search";
