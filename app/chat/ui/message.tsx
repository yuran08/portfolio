"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import { useMemo } from "react";
import { ComponentPropsWithoutRef } from "react";
import { Sparkles } from "lucide-react";
import { Message } from "../type";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-6 flex justify-end">
      <div className="max-w-[80%] rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-lg dark:bg-blue-500">
        <div className="prose prose-invert prose-sm max-w-none">{children}</div>
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
    <div className="my-6 flex justify-start">
      <div className="flex w-full max-w-full items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-4 py-3 shadow-sm dark:bg-slate-800/80">
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParseToMarkdown = ({
  block,
  "data-message-id": messageId,
}: {
  block: Message["content"];
  "data-message-id"?: string;
}) => {
  // 缓存组件配置，避免重复创建
  const components: Components = useMemo(
    () => ({
      // 内联代码样式 - 使用CSS类而不是内联样式
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
            <code className={`inline-code ${className || ""}`} {...props}>
              {children}
            </code>
          );
        }
        // 代码块内的code元素，保持原有高亮
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      // 代码块样式 - 使用优化的CSS类
      pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
        return (
          <div className="code-block-wrapper">
            <pre className="code-block" {...props}>
              {children}
            </pre>
          </div>
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
          className="mb-4 list-outside list-disc space-y-1 pl-6 text-gray-800 dark:text-slate-200"
          {...props}
        >
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
        <ol
          className="mb-4 list-outside list-decimal space-y-1 pl-6 text-gray-800 dark:text-slate-200"
          {...props}
        >
          {children}
        </ol>
      ),
      li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
        <li className="mb-1 leading-relaxed" {...props}>
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
        <tr
          className="border-b border-gray-200 dark:border-gray-700"
          {...props}
        >
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
    }),
    []
  );

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkBreaks, // 支持软换行
        ]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        key={messageId}
        components={components}
        // 确保正确处理换行
        skipHtml={false}
      >
        {block as string}
      </ReactMarkdown>
    </div>
  );
};
