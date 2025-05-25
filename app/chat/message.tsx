"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ComponentPropsWithoutRef } from "react";

const loadHighlightStyle = (theme: string) => {
  // 移除之前的样式
  const existingStyle = document.getElementById('highlight-theme');
  if (existingStyle) {
    existingStyle.remove();
  }

  // 添加新的样式
  const link = document.createElement('link');
  link.id = 'highlight-theme';
  link.rel = 'stylesheet';
  link.href = theme === 'dark'
    ? '/highlight.js/styles/github-dark.css'
    : '/highlight.js/styles/github.css';

  document.head.appendChild(link);
};

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 bg-gray-100 dark:bg-slate-800/80 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:hover:shadow-xl dark:shadow-slate-900/20">
      <div className="items-start gap-3">
        <div className="prose prose-gray dark:prose-invert prose-sm max-w-full text-gray-900 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AssistantMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-blue-100 dark:border-indigo-500/30 bg-blue-50 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-indigo-950/40 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:hover:shadow-xl dark:shadow-slate-900/20">
      <div className="items-start gap-3">
        <div className="prose prose-indigo dark:prose-invert prose-sm max-w-full text-gray-900 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ParseToMarkdown = ({
  block,
  "data-message-id": messageId,
}: {
  block: string;
  "data-message-id"?: string;
}) => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme) {
      loadHighlightStyle(resolvedTheme);
    }
  }, [resolvedTheme]);

  const components: Components = {
    code: ({
      inline,
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<'code'> & {
      inline?: boolean;
    }) => {
      if (inline) {
        return (
          <code className={`${className} px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-sm font-mono`} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} block`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({
      children,
      ...props
    }: ComponentPropsWithoutRef<'pre'>) => {
      return (
        <pre className="overflow-x-auto rounded-lg my-4 border border-gray-200 dark:border-gray-700" {...props}>
          {children}
        </pre>
      );
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      key={messageId}
      components={components}
    >
      {block}
    </ReactMarkdown>
  );
};
