"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ComponentPropsWithoutRef } from "react";

const loadHighlightStyle = (theme: string) => {
  // 移除之前的样式
  const existingStyle = document.getElementById("highlight-theme");
  if (existingStyle) {
    existingStyle.remove();
  }

  // 添加新的样式
  const link = document.createElement("link");
  link.id = "highlight-theme";
  link.rel = "stylesheet";
  link.href =
    theme === "dark"
      ? "/highlight.js/styles/github-dark.css"
      : "/highlight.js/styles/github.css";

  document.head.appendChild(link);
};

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-gray-200 bg-gray-100 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/80 dark:shadow-slate-900/20 dark:hover:shadow-xl">
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
    <div className="my-4 rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-indigo-500/30 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-indigo-950/40 dark:shadow-slate-900/20 dark:hover:shadow-xl">
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
    // 内联代码样式
    code: ({
      inline,
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<"code"> & {
      inline?: boolean;
    }) => {
      if (inline) {
        return (
          <code
            className={`${className} rounded-md border border-gray-300 bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200`}
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className={`${className} rounded-md border border-gray-300 bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200`}
          {...props}
        >
          {children}
        </code>
      );
    },
    // 代码块样式
    pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
      return (
        <pre
          className="my-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          {...props}
        >
          {children}
        </pre>
      );
    },
    // 标题样式
    h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
      <h1
        className="my-4 text-2xl font-bold text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2
        className="my-3 text-xl font-semibold text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
      <h3
        className="my-2 text-lg font-medium text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
      <h4
        className="my-2 text-base font-medium text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h4>
    ),
    h5: ({ children, ...props }: ComponentPropsWithoutRef<"h5">) => (
      <h5
        className="my-2 text-sm font-medium text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h5>
    ),
    h6: ({ children, ...props }: ComponentPropsWithoutRef<"h6">) => (
      <h6
        className="my-2 text-xs font-medium text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </h6>
    ),
    // 段落样式
    p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p
        className="leading-relaxed text-gray-800 dark:text-slate-200"
        {...props}
      >
        {children}
      </p>
    ),
    // 强调样式
    strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
      <strong
        className="font-semibold text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }: ComponentPropsWithoutRef<"em">) => (
      <em className="italic text-gray-800 dark:text-slate-200" {...props}>
        {children}
      </em>
    ),
    // 列表样式
    ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
      <ul
        className="mb-4 list-inside list-disc space-y-1 text-gray-800 dark:text-slate-200"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
      <ol
        className="mb-4 list-inside list-decimal space-y-1 text-gray-800 dark:text-slate-200"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    // 引用样式
    blockquote: ({
      children,
      ...props
    }: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        className="my-4 border-l-4 border-blue-500 bg-blue-50 py-2 pl-4 italic text-gray-800 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-slate-200"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // 表格样式
    table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
      <div className="my-4 overflow-x-auto">
        <table
          className="min-w-full border border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
      <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: ComponentPropsWithoutRef<"tbody">) => (
      <tbody className="bg-white dark:bg-gray-900" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: ComponentPropsWithoutRef<"tr">) => (
      <tr className="border-b border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
      <th
        className="px-4 py-2 text-left font-medium text-gray-900 dark:text-slate-100"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
      <td className="px-4 py-2 text-gray-800 dark:text-slate-200" {...props}>
        {children}
      </td>
    ),
    // 链接样式
    a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => (
      <a
        className="text-blue-600 underline transition-colors hover:text-blue-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    // 分割线样式
    hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
      <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
    ),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        remarkBreaks, // 支持软换行
      ]}
      rehypePlugins={[rehypeHighlight]}
      key={messageId}
      components={components}
      // 确保正确处理换行
      skipHtml={false}
    >
      {block}
    </ReactMarkdown>
  );
};
