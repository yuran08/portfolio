import { Sparkles, Wrench } from "lucide-react";
import "katex/dist/katex.min.css";

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

export const ReasoningMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-2 mt-4 px-2 sm:px-0">
      <div className="border-l-2 border-gray-300 pl-4 text-sm text-gray-500 dark:border-gray-700 dark:text-slate-500">
        <div className="prose prose-sm max-w-none">
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-500">
            推理过程：
          </p>
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
    <div className="mt-4 flex justify-start px-2 sm:mt-6 sm:px-0">
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white sm:h-8 sm:w-8">
          <Sparkles size={14} className="sm:size-4" />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl px-3 sm:px-4">
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
        <div className="rounded-2x min-w-0 flex-1 px-3 shadow-sm sm:px-4">
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
