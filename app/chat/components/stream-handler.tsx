"use client";

import { useEffect, useState } from "react";
import { MemoizedMarkdown } from "./markdown";
import { getAiResponseStream } from "../lib/ai/stream";
import { LoadingSpinner } from "./skeleton";
import { safeJsonParse } from "../lib/json";
import { ToolCall } from "ai";

// const typeMap = {
//   "0": "text",
//   "2": "data",
//   "3": "error",
//   "8": "message_annotations",
//   "9": "tool_call",
//   a: "tool_result",
//   b: "tool_call_streaming_start",
//   c: "tool_call_delta",
//   d: "finish_message",
//   e: "finish_step",
//   f: "start_step",
//   g: "reasoning",
//   h: "source",
//   i: "redacted_reasoning",
//   j: "reasoning_signature",
//   k: "file",
// } as const;

export default function StreamHandler({
  stream,
  conversationId,
}: {
  stream: Awaited<ReturnType<typeof getAiResponseStream>>;
  conversationId: string;
}) {
  const [content, setContent] = useState("");
  const [toolCall, setToolCall] = useState<ToolCall<string, unknown>>();

  useEffect(() => {
    let fullContent = "";

    const processStream = async () => {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (!value || done) {
            reader.cancel();
            break;
          }

          console.log(value, "value");

          if (value.startsWith("9")) {
            const toolCall = safeJsonParse(value.slice(2)) as ToolCall<
              string,
              unknown
            >;
            setToolCall(toolCall);
          }

          if (value.startsWith("0")) {
            const text = safeJsonParse(value.slice(2));
            fullContent += text;
            setContent(fullContent);
          }
        }
      } catch (error) {
        console.error("Stream处理错误:", error);
      }
    };

    processStream();

    return () => {
      // Clean up if needed
    };
  }, [stream, conversationId]);

  return content || toolCall ? (
    <>
      <MemoizedMarkdown id={conversationId} content={content} />
    </>
  ) : (
    <LoadingSpinner size="sm" />
  );
}
