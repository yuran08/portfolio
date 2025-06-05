import { webSearchTool, SearchResponse } from "./web-search";

export interface ToolResult {
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export interface AIToolsManager {
  executeWebSearch: (query: string, enhanced?: boolean) => Promise<ToolResult>;
}

/**
 * AI工具管理器
 */
export const createAIToolsManager = (): AIToolsManager => {
  const executeWebSearch = async (
    query: string,
    enhanced = false
  ): Promise<ToolResult> => {
    try {
      const result = await webSearchTool.execute({ query, enhanced });
      return {
        toolName: "web_search",
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        toolName: "web_search",
        success: false,
        error: error instanceof Error ? error.message : "搜索失败",
        timestamp: new Date().toISOString(),
      };
    }
  };

  return {
    executeWebSearch,
  };
};

/**
 * 格式化搜索结果为Markdown
 */
export const formatSearchResultsToMarkdown = (
  toolResult: ToolResult
): string => {
  if (!toolResult.success || !toolResult.data) {
    return `## ❌ 搜索失败\n\n${toolResult.error || "未知错误"}`;
  }

  return formatWebSearchResults(toolResult.data as SearchResponse);
};

/**
 * 格式化网络搜索结果
 */
const formatWebSearchResults = (data: SearchResponse): string => {
  let markdown = `## 🌐 网络搜索结果\n\n`;

  if (data.results.length === 0) {
    return markdown + "暂无搜索结果。\n\n";
  }

  markdown += `找到 ${data.results.length} 个相关结果：\n\n`;

  data.results.forEach((result, index) => {
    markdown += `### ${index + 1}. ${result.title}\n\n`;
    markdown += `${result.snippet}\n\n`;

    if (result.url && result.url !== "https://example.com") {
      markdown += `🔗 [查看原文](${result.url})\n\n`;
    }

    if (result.content && result.content !== result.snippet) {
      markdown += `<details>\n<summary>查看完整内容</summary>\n\n${result.content}\n\n</details>\n\n`;
    }

    markdown += "---\n\n";
  });

  return markdown;
};

// 导出工具管理器实例
export const aiToolsManager = createAIToolsManager();

// 导出工具类型
export { webSearchTool };
