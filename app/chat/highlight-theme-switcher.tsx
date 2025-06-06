"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Highlight.js主题切换器
 * 配合middleware的预加载使用，只负责主题切换时的样式应用
 */
export function HighlightThemeSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // 由于middleware已经预加载了两种主题的CSS文件
    // 这里只需要在主题切换时应用正确的样式

    const applyTheme = (theme: string) => {
      // 移除现有的highlight主题样式
      const existingStyle = document.getElementById("highlight-theme");
      if (existingStyle) {
        existingStyle.remove();
      }

      // 应用新的主题样式
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "highlight-theme";
      link.href = theme === "dark"
        ? "/highlight.js/styles/github-dark.css"
        : "/highlight.js/styles/github.css";

      document.head.appendChild(link);
    };

    // 初始应用主题
    if (resolvedTheme) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  // 添加一个检查预加载状态的开发环境日志
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // 检查预加载的样式是否存在
      const preloadedStyles = document.querySelectorAll('link[rel="preload"][as="style"]');
      const highlightPreloads = Array.from(preloadedStyles).filter(link =>
        (link as HTMLLinkElement).href.includes('highlight.js/styles')
      );

      console.log(`🎨 [HighlightThemeSwitcher] 发现 ${highlightPreloads.length} 个预加载的highlight样式`);
    }
  }, []);

  return null; // 无UI组件
}