import { webSearchAITool, formatSearchResultsToMarkdown } from "./web-search";
import {
  calculatorAITool,
  formatCalculationResultToMarkdown,
} from "./calculator";

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

// 定义工具结果类型
type WebSearchResult = Parameters<typeof formatSearchResultsToMarkdown>[0];
type CalculatorResult = Parameters<typeof formatCalculationResultToMarkdown>[0];

/**
 * 工具结果格式化方法映射
 * 根据工具名称自动选择对应的格式化函数
 */
export const toolFormatters = {
  web_search: formatSearchResultsToMarkdown,
  calculator: formatCalculationResultToMarkdown,
} as const;

/**
 * 默认格式化方法
 */
const defaultFormatter = (result: unknown): string => {
  // 对于未知工具，尝试显示 summary 或原始结果
  const resultObj = result as { summary?: string };
  return (
    resultObj.summary ||
    `## 🔧 工具调用结果\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
  );
};

/**
 * 统一的工具结果格式化方法
 * @param toolName 工具名称
 * @param result 工具结果
 * @returns 格式化后的 Markdown 字符串
 */
export const formatToolResult = (toolName: string, result: unknown): string => {
  switch (toolName) {
    case "web_search":
      return formatSearchResultsToMarkdown(result as WebSearchResult);
    case "calculator":
      return formatCalculationResultToMarkdown(result as CalculatorResult);
    default:
      return defaultFormatter(result);
  }
};
