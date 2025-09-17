import { UIMessage } from "ai";
import { Wrench } from "lucide-react";

import { MemoizedMarkdown } from "./markdown";

import "katex/dist/katex.min.css";

const UserMessageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-4 flex justify-end px-2 sm:mt-6 sm:px-0">
      <div className="max-w-[85%] rounded-2xl bg-black/80 px-3 py-2 text-white shadow-lg sm:max-w-[80%] sm:px-4 sm:py-3 dark:bg-white dark:text-black/80">
        <div className="prose prose-invert prose-sm max-w-none">{children}</div>
      </div>
    </div>
  );
};

const ReasoningMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mt-4 mb-2 px-2 sm:px-0">
      <div className="border-l-2 border-gray-300 pl-4 text-sm text-gray-500 dark:border-gray-700">
        <div className="prose prose-sm max-w-none">
          <p className="mb-1 text-xs font-medium text-gray-50">推理过程：</p>
          {children}
        </div>
      </div>
    </div>
  );
};

const AssistantMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mt-4 flex justify-start px-2 sm:mt-6 sm:px-0">
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 rounded-2xl px-3 sm:px-4">
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolMessageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="my-4 flex justify-start px-2 sm:my-6 sm:px-0">
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white sm:h-8 sm:w-8">
          <Wrench size={14} className="sm:size-4" />
        </div>
        <div className="rounded-2x min-w-0 flex-1 px-3 shadow-sm sm:px-4">
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RenderMessage = ({ message }: { message: UIMessage }) => {
  if (message.role === "user") {
    return (
      <UserMessageWrapper>
        {message.parts
          .map((part) => (part.type === "text" ? part.text : null))
          .join("")}
      </UserMessageWrapper>
    );
  }

  return (
    <AssistantMessageWrapper>
      {message.parts.map((part, index: number) =>
        part.type === "reasoning" ? (
          <ReasoningMessageWrapper key={index}>
            {part.text}
          </ReasoningMessageWrapper>
        ) : null
      )}
      <MemoizedMarkdown
        id={message.id}
        content={message.parts
          .map((part) => (part.type === "text" ? part.text : null))
          .join("")}
      />
    </AssistantMessageWrapper>
  );
};
