import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. 安全headers设置
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  // 2. Chat路由专用逻辑
  if (pathname.startsWith("/chat")) {
    // 2.1 提取conversationId（如果存在）
    const conversationMatch = pathname.match(/\/chat\/conversation\/([^\/]+)/);
    if (conversationMatch) {
      response.headers.set("x-conversation-id", conversationMatch[1]);
    } else {
      response.headers.set("x-conversation-id", "new-chat");
    }

    // 2.2 预加载highlight.js样式文件
    const highlightPreloads = [
      "</highlight.js/styles/github.css>; rel=preload; as=style; media=screen",
      "</highlight.js/styles/github-dark.css>; rel=preload; as=style; media=screen",
    ];

    response.headers.set("Link", highlightPreloads.join(", "));
  }

  // 3. 性能监控 - 添加请求时间戳
  response.headers.set("x-middleware-timestamp", Date.now().toString());

  return response;
}

// 配置匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api routes (可选择包含或排除)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico, robots.txt等静态文件
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
