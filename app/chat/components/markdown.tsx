import ReactMarkdown, { Components } from "react-markdown";
import { marked } from "marked";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { ComponentPropsWithoutRef, memo, useMemo } from "react";
import "katex/dist/katex.min.css";
import CodeBlock from "./code-block";

/**
 * 预处理LaTeX内容，将各种格式的数学公式转换为remark-math支持的美元符号格式
 * 基于 https://github.com/remarkjs/react-markdown/issues/785 中的讨论
 */
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};

const components: Components = {
  code: CodeBlock,
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="my-4 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="my-3 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-slate-100"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="my-2 text-lg font-medium text-gray-900 sm:text-xl dark:text-slate-100"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4
      className="my-2 text-base font-medium text-gray-900 sm:text-lg dark:text-slate-100"
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: ComponentPropsWithoutRef<"h5">) => (
    <h5
      className="my-2 text-sm font-medium text-gray-900 sm:text-base dark:text-slate-100"
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: ComponentPropsWithoutRef<"h6">) => (
    <h6
      className="my-2 text-xs font-medium text-gray-900 sm:text-sm dark:text-slate-100"
      {...props}
    >
      {children}
    </h6>
  ),
  // 段落样式
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className="leading-relaxed text-gray-800 dark:text-slate-200" {...props}>
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
      className="mb-4 list-outside list-disc space-y-1 pl-5 text-gray-800 sm:pl-6 dark:text-slate-200"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-4 list-outside list-decimal space-y-1 pl-5 text-gray-800 sm:pl-6 dark:text-slate-200"
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
      className="my-4 border-l-4 border-blue-500 bg-blue-50 py-2 pl-3 italic text-gray-800 sm:py-3 sm:pl-4 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-slate-200"
      {...props}
    >
      {children}
    </blockquote>
  ),
  // 表格样式
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full rounded-md" {...props}>
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
      className="px-3 py-2 text-left font-medium text-gray-900 sm:px-4 dark:text-slate-100"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-3 py-2 text-gray-800 sm:px-4 dark:text-slate-200"
      {...props}
    >
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
    <hr
      className="my-4 border-gray-300 sm:my-6 dark:border-gray-600"
      {...props}
    />
  ),
  // 分割线样式
  br: ({ ...props }: ComponentPropsWithoutRef<"br">) => (
    <br className="my-6 border-gray-300 dark:border-gray-600" {...props} />
  ),
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeRaw]}
        components={components}
      >
        {preprocessLaTeX(content)}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);
    console.log(blocks, "blocks");

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

// const markdown = ({ markdown }: { markdown: Message["content"] }) => {
//   return (
//     <div className="markdown-content">
//       <ReactMarkdown
//         remarkPlugins={[remarkGfm, remarkMath]}
//         rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeRaw]}
//         key={Math.random()}
//         components={components}
//       >
//         {preprocessLaTeX(markdown as string)}
//       </ReactMarkdown>
//     </div>
//   );
// };
