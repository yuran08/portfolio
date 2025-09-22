import { aiTools } from "./tools";
import { InferUITools, JSONValue, UIMessage, UIMessagePart } from "ai";
import z from "zod";

export const metadataSchema = z.object({});

type MyMetadata = z.infer<typeof metadataSchema>;

export const dataPartSchema = z.object({
  webSearch: z.object({
    answer: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
      })
    ),
    result: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
        url: z.string(),
      })
    ),
  }),
});

export type MyDataPart = z.infer<typeof dataPartSchema>;

export type MyToolSet = InferUITools<typeof aiTools>;

export type MyUIMessage = UIMessage<MyMetadata, MyDataPart, MyToolSet>;

export type MyUIMessagePart = UIMessagePart<MyDataPart, MyToolSet>;

export type MyProviderMetadata = Record<string, Record<string, JSONValue>>;
