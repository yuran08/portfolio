import * as cheerio from "cheerio";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: string;
}

/**
 * 网络搜索工具
 */
export const searchWeb = async (query: string): Promise<SearchResponse> => {
  try {
    // 使用多个搜索引擎进行搜索
    const searchResults = await searchWithBing(query);

    // 过滤有效结果
    const validResults = searchResults.filter(
      (result) => result.title && result.snippet && result.title.length > 3
    );

    return {
      results:
        validResults.length > 0 ? validResults : getMockSearchResults(query),
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("搜索失败:", error);
    // 回退到模拟搜索结果
    return {
      results: getMockSearchResults(query),
      query,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * 使用Bing搜索（通过搜索建议API）
 */
const searchWithBing = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log("🔍 开始Bing搜索:", query);

    // 使用Bing搜索建议API，无需API key
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // 设置超时时间
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    console.log("📡 Bing响应状态:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`);
    }

    const html = await response.text();
    console.log("📄 Bing HTML长度:", html.length, "字符");

    const results = parseBingResults(html);
    console.log("✅ Bing解析结果:", results.length, "个");

    return results;
  } catch (error) {
    console.error("❌ Bing搜索失败:", error);
    // 尝试使用备用搜索方法
    return await searchWithStartpage(query);
  }
};

/**
 * 解析Bing搜索结果
 */
const parseBingResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // 解析Bing搜索结果
  $(".b_algo").each((index, element) => {
    if (index >= 8) return; // 限制结果数量

    const titleElement = $(element).find("h2 a");
    const snippetElement = $(element).find(".b_caption p");

    const title = titleElement.text().trim();
    const url = titleElement.attr("href") || "";
    const snippet = snippetElement.text().trim();

    if (title && snippet && url) {
      results.push({
        title,
        url: url.startsWith("http") ? url : `https://www.bing.com${url}`,
        snippet,
      });
    }
  });

  return results;
};

/**
 * 使用Startpage搜索作为备用方案
 */
const searchWithStartpage = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log("🔍 开始Startpage搜索:", query);

    const searchUrl = `https://www.startpage.com/sp/search?query=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000), // 8秒超时
    });

    console.log("📡 Startpage响应状态:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Startpage搜索失败: ${response.status}`);
    }

    const html = await response.text();
    console.log("📄 Startpage HTML长度:", html.length, "字符");

    const results = parseStartpageResults(html);
    console.log("✅ Startpage解析结果:", results.length, "个");

    return results;
  } catch (error) {
    console.error("❌ Startpage搜索失败:", error);
    return [];
  }
};

/**
 * 解析Startpage搜索结果
 */
const parseStartpageResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // 解析Startpage搜索结果
  $(".w-gl__result").each((index, element) => {
    if (index >= 8) return;

    const titleElement = $(element).find(".w-gl__result-title a");
    const snippetElement = $(element).find(".w-gl__description");

    const title = titleElement.text().trim();
    const url = titleElement.attr("href") || "";
    const snippet = snippetElement.text().trim();

    if (title && snippet && url) {
      results.push({
        title,
        url,
        snippet,
      });
    }
  });

  return results;
};

/**
 * 获取模拟搜索结果（当所有搜索都失败时）
 */
const getMockSearchResults = (query: string): SearchResult[] => {
  // 根据查询内容提供相关的模拟新闻
  const allResults: SearchResult[] = [
    {
      title: "AI技术最新进展：大模型能力再次突破",
      url: "",
      snippet:
        "人工智能领域迎来新突破，最新的大语言模型在理解和生成能力上有了显著提升。研究人员表示，这些进展将为各行业带来革命性变化。",
      content:
        "最新研究显示，新一代AI模型在多模态理解、代码生成和复杂推理方面表现出色。这些技术的应用将极大地提高工作效率和创新能力。",
    },
    {
      title: "全球科技股表现强劲，投资者信心增强",
      url: "",
      snippet:
        "今日全球主要科技股普遍上涨，投资者对人工智能、清洁能源和生物技术等前沿领域保持乐观态度。",
      content:
        "分析师认为，科技创新驱动的增长模式正在重塑全球经济格局。投资者对具有技术优势的企业表现出强烈兴趣。",
    },
    {
      title: "绿色能源发展加速，可再生能源占比持续提升",
      url: "",
      snippet:
        "最新数据显示，可再生能源在全球能源结构中的占比继续上升。太阳能和风能技术的成本持续下降，推动清洁能源普及。",
      content:
        "各国政府加大对绿色能源的投资力度，预计未来十年内可再生能源将成为主要电力来源。这一转变对应对气候变化具有重要意义。",
    },
    {
      title: "数字化转型深入各行各业",
      url: "",
      snippet:
        "企业数字化转型步伐加快，云计算、大数据和人工智能技术的应用帮助企业提高效率、降低成本。",
      content:
        "数字化技术正在重塑商业模式，从制造业到服务业，各行业都在探索数字化解决方案。这一趋势预计将持续推动经济增长。",
    },
    {
      title: "在线教育与远程办公成为新常态",
      url: "",
      snippet:
        "疫情后时代，在线教育和远程办公模式得到广泛接受。新的协作工具和学习平台为人们提供了更灵活的工作和学习方式。",
      content:
        "技术进步使得远程协作更加高效，许多企业采用混合办公模式。教育领域也在探索线上线下相结合的新教学模式。",
    },
  ];

  // 根据查询关键词选择相关结果
  let selectedResults: SearchResult[] = [];

  if (
    query.includes("AI") ||
    query.includes("人工智能") ||
    query.includes("技术")
  ) {
    selectedResults = [allResults[0], allResults[3]];
  } else if (
    query.includes("股市") ||
    query.includes("投资") ||
    query.includes("经济")
  ) {
    selectedResults = [allResults[1], allResults[3]];
  } else if (
    query.includes("环保") ||
    query.includes("能源") ||
    query.includes("绿色")
  ) {
    selectedResults = [allResults[2], allResults[4]];
  } else if (
    query.includes("教育") ||
    query.includes("办公") ||
    query.includes("远程")
  ) {
    selectedResults = [allResults[4], allResults[0]];
  } else {
    // 默认返回综合新闻
    selectedResults = allResults.slice(0, 3);
  }

  // 添加搜索状态说明
  selectedResults.push({
    title: "搜索状态说明",
    url: "",
    snippet: `当前网络搜索服务暂时不可用，以上是根据"${query}"相关的模拟信息。如需最新资讯，建议稍后重试或使用其他搜索方式。`,
  });

  return selectedResults;
};

/**
 * 获取网页内容
 */
export const fetchWebContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Assistant/1.0)",
      },
      signal: AbortSignal.timeout(8000), // 8秒超时
    });

    if (!response.ok) {
      throw new Error(`获取网页失败: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 移除不需要的元素
    $(
      "script, style, nav, header, footer, aside, .ad, .advertisement"
    ).remove();

    // 提取主要内容
    let content = "";
    const contentSelectors = [
      "main",
      "article",
      ".content",
      ".post-content",
      ".entry-content",
      "#content",
      ".main-content",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // 如果没有找到主要内容区域，使用body
    if (!content) {
      content = $("body").text().trim();
    }

    // 清理文本
    content = content
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    // 限制内容长度
    if (content.length > 3000) {
      content = content.substring(0, 3000) + "...";
    }

    return content;
  } catch (error) {
    console.error("获取网页内容失败:", error);
    return "";
  }
};

/**
 * 增强搜索：为前几个结果获取完整内容
 */
export const enhancedSearch = async (
  query: string
): Promise<SearchResponse> => {
  try {
    const searchResponse = await searchWeb(query);

    // 为前3个结果获取完整内容
    const enhancedResults = await Promise.all(
      searchResponse.results.slice(0, 3).map(async (result, index) => {
        if (
          result.url &&
          !result.content &&
          result.url !== "https://example.com"
        ) {
          const content = await fetchWebContent(result.url);
          console.log(content, index, "webcontent");

          return { ...result, content };
        }
        return result;
      })
    );

    // 合并增强的结果和剩余结果
    const allResults = [...enhancedResults, ...searchResponse.results.slice(3)];

    return {
      ...searchResponse,
      results: allResults,
    };
  } catch (error) {
    console.error("增强搜索失败:", error);
    return searchWeb(query);
  }
};

/**
 * 网络搜索工具的统一接口
 */
export const webSearchTool = {
  name: "web_search",
  description: "搜索互联网获取最新信息",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "搜索查询词",
      },
      enhanced: {
        type: "boolean",
        description: "是否启用增强搜索（获取完整网页内容）",
        default: false,
      },
    },
    required: ["query"],
  },
  execute: async (params: { query: string; enhanced?: boolean }) => {
    console.log(params, "params");

    if (params.enhanced) {
      return await enhancedSearch(params.query);
    }
    return await searchWeb(params.query);
  },
};
