import { marked } from "marked";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 bg-gray-100 dark:bg-slate-800/80 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:hover:shadow-xl dark:shadow-slate-900/20">
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
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
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-indigo dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ParseToMarkdown = async ({
  block,
  "data-message-id": messageId,
}: {
  block: string;
  "data-message-id"?: string;
}) => {
  const html = await marked(block);
  return (
    <div
      data-message-id={messageId}
      className="animate-fade-in motion-safe:animate-fadeIn"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
