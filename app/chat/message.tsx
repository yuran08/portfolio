import { marked } from "marked";

export const UserMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="my-4 rounded-2xl border border-gray-200 bg-gray-100 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-gray prose-sm max-w-none">
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
    <div className="my-4 rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="markdown-content prose prose-indigo prose-sm max-w-none">
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
