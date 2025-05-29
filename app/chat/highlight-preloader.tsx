"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// 预加载样式缓存
const styleCache = new Map<string, HTMLLinkElement>();

export function HighlightPreloader() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // 预加载两种主题的样式
    const themes = ["light", "dark"];

    themes.forEach((theme) => {
      if (!styleCache.has(theme)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "style";
        link.href =
          theme === "dark"
            ? "/highlight.js/styles/github-dark.css"
            : "/highlight.js/styles/github.css";

        // 预加载完成后，将其转换为实际的样式表
        link.onload = () => {
          const actualLink = document.createElement("link");
          actualLink.rel = "stylesheet";
          actualLink.href = link.href;
          actualLink.id = `highlight-${theme}`;

          // 如果是当前主题，立即应用
          if (
            theme === resolvedTheme ||
            (theme === "light" && !resolvedTheme)
          ) {
            actualLink.id = "highlight-theme";
            document.head.appendChild(actualLink);
          }

          styleCache.set(theme, actualLink);
        };

        document.head.appendChild(link);
      }
    });
  }, [resolvedTheme]);

  // 主题切换时快速应用样式
  useEffect(() => {
    if (resolvedTheme) {
      const themeKey = resolvedTheme === "dark" ? "dark" : "light";
      const cachedStyle = styleCache.get(themeKey);

      if (cachedStyle) {
        // 移除当前样式
        const existingStyle = document.getElementById("highlight-theme");
        if (existingStyle) {
          existingStyle.remove();
        }

        // 应用新样式
        const newStyle = cachedStyle.cloneNode(true) as HTMLLinkElement;
        newStyle.id = "highlight-theme";
        document.head.appendChild(newStyle);
      }
    }
  }, [resolvedTheme]);

  return null; // 这是一个无UI组件
}
