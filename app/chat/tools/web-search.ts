import { tool } from "ai";
import { z } from "zod";
import type { TavilySearchResponse, TavilySearchOptions } from "@tavily/core";

// 从 TavilySearchResponse 中提取类型（已简化，不再使用完整类型）

// 定义搜索工具的参数模式
export const webSearchToolSchema = z.object({
  query: z.string().describe("要搜索的查询内容"),
  search_depth: z
    .enum(["basic", "advanced"])
    .optional()
    .describe(
      "搜索的深度。可以是 'basic' 或 'advanced'。'advanced' 搜索用于检索与您的查询最相关的来源和 content 段落，而 'basic' 搜索则提供来源的通用内容段落。"
    )
    .default("basic"),
  topic: z
    .enum(["general", "news", "finance"])
    .optional()
    .describe(
      "搜索的分类。'news' 适用于获取实时更新，特别是关于政治、体育和主流媒体来源报道的重大时事。'general' 适用于更广泛、更通用的搜索，可能包括多种来源。'finance' 适用于金融相关的搜索。"
    )
    .default("general"),
  max_results: z
    .number()
    .optional()
    .describe("最大结果数量（1-20）")
    .default(5),
  include_raw_content: z
    .enum(["text", "markdown"])
    .optional()
    .describe("是否包含原始网页内容，可以是 'text' 或 'markdown' 格式")
    .default("markdown"),
  include_answer: z
    .boolean()
    .optional()
    .describe("是否包含AI生成的答案摘要")
    .default(true),
  include_images: z
    .boolean()
    .optional()
    .describe("是否包含相关图片")
    .default(true),
  country: z
    .string()
    .optional()
    .describe("指定搜索的国家/地区")
    .default("china"),
  days: z.number().optional().describe("搜索最近多少天的内容"),
  time_range: z
    .enum(["year", "month", "week", "day", "y", "m", "w", "d"])
    .optional()
    .describe("时间范围过滤器"),
});

/**
 * 使用 Tavily Search API 进行搜索
 */
export const searchWeb = async (
  query: string,
  options: Partial<TavilySearchOptions> = {}
): Promise<TavilySearchResponse> => {
  try {
    console.log("🔍 开始Tavily搜索:", { query, options });

    // 检查是否有 API 密钥
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("未配置 TAVILY_API_KEY 环境变量");
    }

    // 动态导入 Tavily
    const { tavily } = await import("@tavily/core");
    const tvly = tavily({ apiKey });

    // 设置默认选项
    const searchOptions: TavilySearchOptions = {
      searchDepth: "basic",
      topic: "general",
      maxResults: 5,
      includeRawContent: "markdown",
      includeAnswer: true,
      includeImages: true,
      country: "china",
      ...options,
    };

    // 执行搜索
    const response = await tvly.search(query, searchOptions);

    console.log("✅ Tavily搜索成功:", {
      query: response.query,
      resultsCount: response.results?.length || 0,
      hasAnswer: !!response.answer,
      responseTime: response.responseTime,
    });

    return response;
  } catch (error) {
    console.error("❌ Tavily搜索失败:", error);

    // 返回空结果
    return {
      query,
      responseTime: 0,
      images: [],
      results: [],
    };
  }
};

/**
 * AI 工具配置 - 网络搜索
 */
export const webSearchAITool = tool({
  description: "使用Tavily Search API搜索互联网获取最新信息和新闻，专为AI优化",
  parameters: webSearchToolSchema,
  execute: async ({
    query,
    search_depth = "basic",
    topic = "general",
    max_results = 5,
    include_raw_content = "markdown",
    include_answer = true,
    include_images = true,
    country = "china",
    days,
    time_range,
  }) => {
    try {
      const searchOptions: Partial<TavilySearchOptions> = {
        searchDepth: search_depth,
        topic,
        maxResults: Math.min(Math.max(max_results, 1), 20), // 限制在 1-20 之间
        includeRawContent: include_raw_content,
        includeAnswer: include_answer,
        includeImages: include_images,
        country,
        ...(days && { days }),
        ...(time_range && { timeRange: time_range }),
      };

      const result = await searchWeb(query, searchOptions);

      // 提取渲染必要的精简数据
      const renderData = {
        results:
          result.results?.map((item) => ({
            title: item.title,
            url: item.url,
          })) || [],
      };

      return {
        success: true,
        query: result.query,
        answer: result.answer,
        results: result.results,
        images: result.images,
        // 新增：渲染必要的精简数据
        renderData,
        // 搜索结果需要AI根据内容生成回答
        requiresFollowUp: true,
      };
    } catch (error) {
      console.error("❌ Tavily搜索工具执行失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "搜索失败",
        query,
        // 错误情况下也提供renderData
        renderData: {
          query,
          results: [],
          resultsCount: 0,
          error: error instanceof Error ? error.message : "搜索失败",
        },
      };
    }
  },
});

/**
 * 格式化搜索结果为 Markdown
 */
export const formatSearchResultsToMarkdown = (searchResponse: {
  results: Array<{
    title: string;
    url: string;
  }>;
}): string => {
  let markdown = `### 🌐 网络搜索结果\n\n`;

  if (searchResponse.results.length === 0) {
    markdown += "暂无搜索结果。\n\n";
    return markdown;
  }

  searchResponse.results.forEach((result, index: number) => {
    markdown += `##### ${index + 1}. ${result.title}  `;

    if (result.url) {
      markdown += `🔗 [查看原文](${result.url})\n\n`;
    }
  });

  return markdown;
};
