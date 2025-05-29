"use client";

import { useEffect, useRef } from "react";
import { ParseToMarkdown } from "./message";

interface StreamingMarkdownProps {
  block: string;
  "data-message-id"?: string;
  onContentUpdate?: () => void;
}

export function StreamingMarkdown({
  block,
  "data-message-id": messageId,
  onContentUpdate,
}: StreamingMarkdownProps) {
  const prevBlockRef = useRef<string>("");
  const elementRef = useRef<HTMLDivElement>(null);

  // 监听内容变化
  useEffect(() => {
    if (block !== prevBlockRef.current) {
      prevBlockRef.current = block;

      // 触发内容更新回调
      if (onContentUpdate) {
        onContentUpdate();
      }

      // 触发自定义事件，通知父组件内容已更新
      if (elementRef.current) {
        const event = new CustomEvent("streamingUpdate", {
          detail: { messageId, content: block },
          bubbles: true,
        });
        elementRef.current.dispatchEvent(event);
      }
    }
  }, [block, messageId, onContentUpdate]);

  return (
    <div ref={elementRef} className="streaming-markdown">
      <ParseToMarkdown block={block} data-message-id={messageId} />
    </div>
  );
}
