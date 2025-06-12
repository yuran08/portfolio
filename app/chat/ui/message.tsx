"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import { useMemo } from "react";
import { ComponentPropsWithoutRef } from "react";
import { Sparkles, Wrench } from "lucide-react";
import { Message } from "../type";
import "katex/dist/katex.min.css";

/**
 * 预处理LaTeX内容，将各种格式的数学公式转换为remark-math支持的美元符号格式
 * 基于 https://github.com/remarkjs/react-markdown/issues/785 中的讨论
 */
function preprocessLaTeX(content: string) {
  // 步骤1: 保护代码块
  const codeBlocks: string[] = [];
  let processedContent = content.replace(
    /(`{3,}[\s\S]*?`{3,}|`[^`\n]+`)/g,
    (match, code) => {
      codeBlocks.push(code);
      return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
    }
  );

  // 步骤2: 保护现有的LaTeX表达式
  const latexExpressions: string[] = [];
  processedContent = processedContent.replace(
    /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g,
    (match) => {
      latexExpressions.push(match);
      return `<<LATEX_${latexExpressions.length - 1}>>`;
    }
  );

  // 步骤3: 转换反斜杠分隔符到美元符号
  // 块级公式: \[ ... \] 转换为 $$ ... $$
  processedContent = processedContent.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (match, content) => {
      return `$$${content}$$`;
    }
  );

  // 行内公式: \( ... \) 转换为 $ ... $
  // 改进：移除过度限制，支持更复杂的数学公式
  processedContent = processedContent.replace(
    /\\\(([^\\]*?(?:\\.[^\\]*?)*?)\\\)/g,
    (match, content) => {
      // 只过滤明显不是数学公式的内容
      // 检查是否包含大量中文文本（超过总长度的50%）
      const chineseCharCount = (content.match(/[\u4e00-\u9fff]/g) || []).length;
      const totalLength = content.length;

      // 如果中文字符超过50%，或者内容过长且明显是文本，则跳过转换
      if (
        chineseCharCount > totalLength * 0.5 ||
        (totalLength > 200 &&
          !/[a-zA-Z\d\+\-\*\/\=\^\{\}\(\)\[\]\\]/.test(content))
      ) {
        return match; // 保持原样，不转换
      }
      return `$${content}$`;
    }
  );

  // 步骤4: 恢复LaTeX表达式
  processedContent = processedContent.replace(
    /<<LATEX_(\d+)>>/g,
    (_, index) => latexExpressions[parseInt(index)]
  );

  // 步骤5: 恢复代码块
  processedContent = processedContent.replace(
    /<<CODE_BLOCK_(\d+)>>/g,
    (_, index) => codeBlocks[parseInt(index)]
  );

  return processedContent;
}

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mt-4 flex justify-end px-2 sm:mt-6 sm:px-0">
      <div className="max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-white shadow-lg sm:max-w-[80%] sm:px-4 sm:py-3 dark:bg-blue-500">
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
    <div className="mt-4 flex justify-start px-2 sm:mt-6 sm:px-0">
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white sm:h-8 sm:w-8">
          <Sparkles size={14} className="sm:size-4" />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-3 py-2 shadow-sm sm:px-4 sm:py-3 dark:bg-slate-800/80">
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToolMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 flex justify-start px-2 sm:my-6 sm:px-0">
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white sm:h-8 sm:w-8">
          <Wrench size={14} className="sm:size-4" />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl bg-orange-50 px-3 py-2 shadow-sm sm:px-4 sm:py-3 dark:bg-orange-800/40">
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
          remarkMath, // 处理数学公式
          remarkBreaks, // 支持软换行
        ]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        key={messageId}
        components={components}
        // 确保正确处理换行
        skipHtml={false}
      >
        {preprocessLaTeX(block as string)}
      </ReactMarkdown>
    </div>
  );
};
