"use client";

import { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

import { Loader } from "@/components/ai-elements/loader";
import { Fragment } from "react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";

export function ChatMessages({
  messages,
  status,
  regenerate,
}: {
  messages: UIMessage[];
  status: ReturnType<typeof useChat>["status"];
  regenerate: ReturnType<typeof useChat>["regenerate"];
}) {
  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, messageIndex) => (
          <Fragment key={message.id}>
            <Message from={message.role}>
              <MessageContent variant="flat">
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    // case "step-start":
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    case "text":
                      const isLastMessage =
                        messageIndex === messages.length - 1;
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Response>{part.text}</Response>
                          {message.role === "assistant" &&
                            ((isLastMessage && status === "ready") ||
                              !isLastMessage) && (
                              <Actions>
                                <Action
                                  onClick={() =>
                                    regenerate({ messageId: message.id })
                                  }
                                  tooltip="重新生成"
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-4" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  tooltip="复制"
                                  label="Copy"
                                >
                                  <CopyIcon className="size-4" />
                                </Action>
                              </Actions>
                            )}
                        </Fragment>
                      );
                    case "tool-web_search":
                      return (
                        <Tool defaultOpen={false} key={`${message.id}-${i}`}>
                          <ToolHeader
                            type="tool-web_search"
                            state={part.state}
                          />
                          <ToolContent>
                            <ToolInput input={part.input} />
                            <ToolOutput
                              output={part.output}
                              errorText={part.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    default:
                      return;
                  }
                })}
              </MessageContent>
            </Message>
            {message.role === "user" && (
              <Actions className="-mt-2 justify-end">
                <Action
                  onClick={() =>
                    navigator.clipboard.writeText(
                      message.parts.find((item) => item.type === "text")
                        ?.text || ""
                    )
                  }
                  tooltip="复制"
                  label="Copy"
                >
                  <CopyIcon className="size-4" />
                </Action>
              </Actions>
            )}
          </Fragment>
        ))}
        {(status === "submitted" || status === "streaming") && (
          <Message className="py-0" from="system" key="loading">
            <MessageContent variant="flat">
              <Loader />
            </MessageContent>
          </Message>
        )}
      </ConversationContent>
      <ConversationScrollButton className="dark:bg-black dark:text-foreground" />
    </Conversation>
  );
}
