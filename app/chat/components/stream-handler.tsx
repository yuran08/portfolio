"use client";

import { useEffect, useState } from "react";
import { MemoizedMarkdown } from "./markdown";

export default function StreamHandler({
  generator,
  conversationId,
  initialContent = "",
}: {
  generator: AsyncGenerator<string, void, unknown>;
  conversationId: string;
  initialContent?: string;
}) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    let isMounted = true;
    let fullContent = initialContent;

    const processGenerator = async () => {
      try {
        while (true) {
          const { done, value } = await generator.next();

          if (done) {
            break;
          }

          if (value && isMounted) {
            fullContent += value;
            setContent(fullContent);
          }
        }
      } catch (error) {
        console.error("Generator处理错误:", error);
      }
    };

    processGenerator();

    return () => {
      isMounted = false;
    };
  }, [generator, conversationId, initialContent]);

  return <MemoizedMarkdown id={conversationId} content={content} />;
}
