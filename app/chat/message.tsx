import { marked } from "marked";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-gray-100">
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
    <div className="my-4 rounded-2xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-indigo dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-gray-100">
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
