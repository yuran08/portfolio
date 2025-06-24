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
      link.href =
        theme === "dark"
          ? "/highlight.js/styles/github-dark.css"
          : "/highlight.js/styles/github.css";

      document.head.appendChild(link);
    };

    // 初始应用主题
    if (resolvedTheme) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  return null; // 无UI组件
}
