import { tool } from "ai";
import { z } from "zod";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  score?: number;
  published_date?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: string;
  answer?: string;
  images?: string[];
  follow_up_questions?: string[];
}

// 定义搜索工具的参数模式
export const webSearchToolSchema = z.object({
  query: z.string().describe("要搜索的查询内容"),
  search_depth: z
    .enum(["basic", "advanced"])
    .optional()
    .describe("搜索深度：basic为快速搜索，advanced为深度搜索")
    .default("basic"),
  max_results: z
    .number()
    .optional()
    .describe("最大结果数量（1-20）")
    .default(5),
  include_answer: z
    .boolean()
    .optional()
    .describe("是否包含AI生成的答案摘要")
    .default(true),
  include_raw_content: z
    .boolean()
    .optional()
    .describe("是否包含原始网页内容")
    .default(false),
  country: z.string().optional().describe("国家名称").default("china"),
});

/**
 * 使用 Tavily Search API 进行搜索
 */
export const searchWeb = async (
  query: string,
  searchDepth: "basic" | "advanced" = "basic",
  maxResults: number = 5,
  includeAnswer: boolean = false,
  includeRawContent: boolean = false,
  country: string = "china"
): Promise<SearchResponse> => {
  try {
    console.log("🔍 开始Tavily搜索:", { query, searchDepth, maxResults });

    // 检查是否有 API 密钥
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("未配置 TAVILY_API_KEY 环境变量");
    }

    // 动态导入 Tavily
    const { tavily } = await import("@tavily/core");
    const tvly = tavily({ apiKey });

    // 执行搜索
    const response = await tvly.search(query, {
      search_depth: searchDepth,
      max_results: Math.min(Math.max(maxResults, 1), 20), // 限制在 1-20 之间
      include_answer: includeAnswer,
      include_images: true,
      include_raw_content: includeRawContent,
      country,
    });

    console.log("✅ Tavily搜索成功:", {
      query: response.query,
      resultsCount: response.results?.length || 0,
      results: response.results,
      hasAnswer: !!response.answer,
    });

    // 转换结果格式
    const results: SearchResult[] = (response.results || []).map(
      (result: {
        title?: string;
        url?: string;
        content?: string;
        raw_content?: string;
        score?: number;
        published_date?: string;
      }) => ({
        title: result.title || "",
        url: result.url || "",
        snippet: result.content || "",
        content: result.raw_content || result.content,
        score: result.score,
        published_date: result.published_date,
      })
    );

    return {
      results,
      query: response.query || query,
      timestamp: new Date().toISOString(),
      answer: response.answer,
      images: (response.images || []).map((img: string | { url?: string }) =>
        typeof img === "string" ? img : img.url || ""
      ),
      follow_up_questions:
        (response as { follow_up_questions?: string[] }).follow_up_questions ||
        [],
    };
  } catch (error) {
    console.error("❌ Tavily搜索失败:", error);

    // 返回空结果而不是模拟数据
    return {
      results: [],
      query,
      timestamp: new Date().toISOString(),
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
    max_results = 5,
    include_answer = false,
    include_raw_content = false,
    country = "china",
  }) => {
    console.log("🔍 AI调用Tavily搜索工具:", {
      query,
      search_depth,
      max_results,
      include_answer,
    });

    try {
      const result = await searchWeb(
        query,
        search_depth,
        max_results,
        include_answer,
        include_raw_content,
        country
      );

      return {
        success: true,
        query: result.query,
        answer: result.answer,
        results: result.results,
        images: result.images,
        follow_up_questions: result.follow_up_questions,
        timestamp: result.timestamp,
        summary: `找到 ${result.results.length} 个搜索结果${result.answer ? "，并生成了AI摘要" : ""}`,
      };
    } catch (error) {
      console.error("❌ Tavily搜索工具执行失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "搜索失败",
        query,
      };
    }
  },
});

/**
 * 格式化搜索结果为 Markdown
 */
export const formatSearchResultsToMarkdown = (
  searchResponse:
    | SearchResponse
    | {
        success: boolean;
        query?: string;
        answer?: string;
        results?: SearchResult[];
        images?: string[];
        follow_up_questions?: string[];
        error?: string;
      }
): string => {
  // 处理工具返回的格式
  if ("success" in searchResponse) {
    if (!searchResponse.success) {
      return `## ❌ 搜索失败\n\n${searchResponse.error || "未知错误"}`;
    }

    // 转换为标准格式
    const standardResponse: SearchResponse = {
      results: searchResponse.results || [],
      query: searchResponse.query || "",
      timestamp: new Date().toISOString(),
      answer: searchResponse.answer,
      images: searchResponse.images,
      follow_up_questions: searchResponse.follow_up_questions,
    };

    return formatSearchResultsToMarkdown(standardResponse);
  }

  let markdown = `## 🌐 网络搜索结果\n\n`;

  if (searchResponse.answer) {
    markdown += `### 🤖 AI摘要\n\n${searchResponse.answer}\n\n`;
  }

  if (searchResponse.results.length === 0) {
    markdown += "暂无搜索结果。\n\n";
    return markdown;
  }

  markdown += `### 📚 详细结果 (${searchResponse.results.length}个)\n\n`;

  searchResponse.results.forEach((result, index) => {
    markdown += `#### ${index + 1}. ${result.title}\n\n`;
    markdown += `${result.snippet}\n\n`;

    if (result.url) {
      markdown += `🔗 [查看原文](${result.url})\n\n`;
    }

    if (result.score) {
      markdown += `📊 相关度: ${Math.round(result.score * 100)}%\n\n`;
    }

    if (result.published_date) {
      markdown += `📅 发布时间: ${result.published_date}\n\n`;
    }

    if (
      result.content &&
      result.content !== result.snippet &&
      result.content.length > result.snippet.length
    ) {
      markdown += `<details>\n<summary>查看完整内容</summary>\n\n${result.content}\n\n</details>\n\n`;
    }

    markdown += "---\n\n";
  });

  if (
    searchResponse.follow_up_questions &&
    searchResponse.follow_up_questions.length > 0
  ) {
    markdown += `### 🤔 相关问题\n\n`;
    searchResponse.follow_up_questions.forEach((question, index) => {
      markdown += `${index + 1}. ${question}\n`;
    });
    markdown += "\n";
  }

  if (searchResponse.images && searchResponse.images.length > 0) {
    markdown += `### 🖼️ 相关图片\n\n`;
    searchResponse.images.slice(0, 3).forEach((imageUrl, index) => {
      markdown += `![图片 ${index + 1}](${imageUrl})\n\n`;
    });
  }

  return markdown;
};
