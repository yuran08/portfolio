import { MyUIMessagePart } from "../message-type";
import { MyDBUIMessagePart, MyDBUIMessagePartSelect } from "../db/schema";

export const mapUIMessagePartsToDBParts = (
  messageParts: MyUIMessagePart[],
  messageId: string
): MyDBUIMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case "text":
        return {
          messageId,
          order: index,
          type: part.type,
          text_text: part.text,
        };
      case "reasoning":
        return {
          messageId,
          order: index,
          type: part.type,
          reasoning_text: part.text,
          providerMetadata: part.providerMetadata,
        };
      case "file":
        return {
          messageId,
          order: index,
          type: part.type,
          file_mediaType: part.mediaType,
          file_filename: part.filename,
          file_url: part.url,
        };
      case "source-document":
        return {
          messageId,
          order: index,
          type: part.type,
          source_document_sourceId: part.sourceId,
          source_document_mediaType: part.mediaType,
          source_document_title: part.title,
          source_document_filename: part.filename,
          providerMetadata: part.providerMetadata,
        };
      case "source-url":
        return {
          messageId,
          order: index,
          type: part.type,
          source_url_sourceId: part.sourceId,
          source_url_url: part.url,
          source_url_title: part.title,
          providerMetadata: part.providerMetadata,
        };
      case "step-start":
        return {
          messageId,
          order: index,
          type: part.type,
        };
      case "tool-web_search":
        return {
          messageId,
          order: index,
          type: part.type,
          tool_toolCallId: part.toolCallId,
          tool_state: part.state,
          tool_getWebSearch_input:
            part.state === "input-available" ||
            part.state === "output-available" ||
            part.state === "output-error"
              ? part.input
              : undefined,
          tool_getWebSearch_output:
            part.state === "output-available" ? part.output : undefined,
          tool_getWebSearch_errorText:
            part.state === "output-error" ? part.errorText : undefined,
        };
      case "data-webSearch":
        return {
          messageId,
          order: index,
          type: part.type,
          data_weather_id: part.id,
          data_webSearch_result: part.data.result,
          data_webSearch_answer: part.data.answer,
          data_webSearch_images: part.data.images,
          // no need to persist loading variable -> set to false in mapping below
        };
      default:
        throw new Error(`Unsupported part type: ${part}`);
    }
  });
};

export const mapDBPartToUIMessagePart = (
  part: MyDBUIMessagePartSelect
): MyUIMessagePart => {
  switch (part.type) {
    case "text":
      return {
        type: part.type,
        text: part.text_text!,
      };
    case "reasoning":
      return {
        type: part.type,
        text: part.reasoning_text!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "file":
      return {
        type: part.type,
        mediaType: part.file_mediaType!,
        filename: part.file_filename!,
        url: part.file_url!,
      };
    case "source-document":
      return {
        type: part.type,
        sourceId: part.source_document_sourceId!,
        mediaType: part.source_document_mediaType!,
        title: part.source_document_title!,
        filename: part.source_document_filename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "source-url":
      return {
        type: part.type,
        sourceId: part.source_url_sourceId!,
        url: part.source_url_url!,
        title: part.source_url_title!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "step-start":
      return {
        type: part.type,
      };
    case "tool-web_search":
      if (!part.tool_state) {
        throw new Error("getWeatherInformation_state is undefined");
      }
      switch (part.tool_state) {
        case "input-streaming":
          return {
            type: "tool-web_search",
            state: "input-streaming",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWebSearch_input!,
          };
        case "input-available":
          return {
            type: "tool-web_search",
            state: "input-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWebSearch_input!,
          };
        case "output-available":
          return {
            type: "tool-web_search",
            state: "output-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWebSearch_input!,
            output: part.tool_getWebSearch_output!,
          };
        case "output-error":
          return {
            type: "tool-web_search",
            state: "output-error",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_getWebSearch_input!,
            errorText: part.tool_errorText!,
          };
      }
    case "data-webSearch":
      return {
        type: "data-webSearch",
        data: {
          answer: part.data_webSearch_answer!,
          images: part.data_webSearch_images!,
          result: part.data_webSearch_result!,
        },
        id: part.data_webSearch_id!,
      };
    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};
