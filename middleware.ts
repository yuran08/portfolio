import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. 添加自定义headers，方便服务端组件获取路径信息
  response.headers.set("x-pathname", pathname);
  response.headers.set("x-url", request.url);
  response.headers.set("x-origin", request.nextUrl.origin);

  // 2. 安全headers设置
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  // 3. Chat路由专用逻辑
  if (pathname.startsWith("/chat")) {
    // 3.1 为chat页面添加特殊标识
    response.headers.set("x-section", "chat");

    // 3.2 提取conversationId（如果存在）
    const conversationMatch = pathname.match(/\/chat\/conversation\/([^\/]+)/);
    if (conversationMatch) {
      response.headers.set("x-conversation-id", conversationMatch[1]);
    }

    // 3.3 预加载highlight.js样式文件
    const highlightPreloads = [
      "</highlight.js/styles/github.css>; rel=preload; as=style; media=screen",
      "</highlight.js/styles/github-dark.css>; rel=preload; as=style; media=screen"
    ];

    response.headers.set("Link", highlightPreloads.join(", "));

    // 3.4 记录访问日志（开发环境）
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [Middleware] Chat访问: ${pathname}`);
      console.log(`🎨 [Middleware] Highlight.js预加载已设置`);
    }
  }

  // 4. 根路径重定向逻辑
  if (pathname === "/") {
    // 4.1 检查是否有来源页面偏好
    const preferredSection = request.cookies.get("preferred-section")?.value;

    if (preferredSection === "chat") {
      return NextResponse.redirect(new URL("/chat", request.url));
    }

    // 4.2 添加首页标识
    response.headers.set("x-section", "home");
  }

  // 5. API路由保护（如果有敏感API）
  if (pathname.startsWith("/api/")) {
    // 5.1 添加API标识
    response.headers.set("x-section", "api");

    // 5.2 Rate limiting headers（示例）
    const ip = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";
    response.headers.set("x-client-ip", ip);

    // 5.3 CORS预处理（如果需要）
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
  }

  // 6. 性能监控 - 添加请求时间戳
  response.headers.set("x-middleware-timestamp", Date.now().toString());

  // 7. 开发环境调试信息
  if (process.env.NODE_ENV === "development") {
    response.headers.set("x-debug-info", JSON.stringify({
      pathname,
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    }));
  }

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