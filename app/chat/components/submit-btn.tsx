import { ArrowUp, Squircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";

export function SubmitBtn({
  isLoading,
  stop,
}: {
  isLoading: boolean;
  stop: ReturnType<typeof useChat>["stop"];
}) {
  return isLoading ? (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        stop();
      }}
      className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-colors duration-200 hover:bg-blue-600 active:scale-95 sm:p-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-500"
    >
      <Squircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  ) : (
    <button
      type="submit"
      className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-colors duration-200 hover:bg-blue-600 active:scale-95 sm:p-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-500"
    >
      <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
}
