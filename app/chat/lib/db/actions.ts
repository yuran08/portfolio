"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../db";
import { chats, messages, MyDBUIMessagePartSelect, parts } from "./schema";
import { MyUIMessage } from "../message-type";
import {
  mapUIMessagePartsToDBParts,
  mapDBPartToUIMessagePart,
} from "../utils/message-mapping";

export const createChat = async (id: string) => {
  await db.insert(chats).values({
    id,
  });
};

export const upsertMessage = async ({
  chatId,
  message,
  id,
}: {
  id: string;
  chatId: string;
  message: MyUIMessage;
}) => {
  const mappedDBUIParts = mapUIMessagePartsToDBParts(message.parts, id);

  await db.transaction(async (tx) => {
    await tx
      .insert(messages)
      .values({
        chatId,
        role: message.role,
        id,
      })
      .onConflictDoUpdate({
        target: messages.id,
        set: {
          chatId,
        },
      });

    await tx.delete(parts).where(eq(parts.messageId, id));
    if (mappedDBUIParts.length > 0) {
      await tx.insert(parts).values(mappedDBUIParts);
    }
  });
};

export const loadChat = async (chatId: string): Promise<MyUIMessage[]> => {
  const result = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    with: {
      parts: {
        orderBy: (parts, { asc }) => [asc(parts.order)],
      },
    },
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });
  console.log("load chat output:", result);

  return result.map((message) => ({
    id: message.id,
    role: message.role,
    parts: (message.parts as MyDBUIMessagePartSelect[]).map((part) =>
      mapDBPartToUIMessagePart(part)
    ),
  }));
};

export const getChats = async (limit: number = 20, offset: number = 0) => {
  return await db
    .select()
    .from(chats)
    .orderBy(chats.createdAt)
    .limit(limit)
    .offset(offset);
};

export const getTotalChatsCount = async () => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(chats);
  return result[0]?.count || 0;
};

export const deleteChat = async (chatId: string) => {
  await db.delete(chats).where(eq(chats.id, chatId));
};

export const deleteMessage = async (messageId: string) => {
  await db.transaction(async (tx) => {
    const [targetMessage] = await tx
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!targetMessage) return;

    // Delete all messages after this one in the chat
    await tx
      .delete(messages)
      .where(
        and(
          eq(messages.chatId, targetMessage.chatId),
          gt(messages.createdAt, targetMessage.createdAt)
        )
      );

    // Delete the target message (cascade delete will handle parts)
    await tx.delete(messages).where(eq(messages.id, messageId));
  });
};

export const clearChats = async () => {
  try {
    // 由于外键约束，删除 chats 会自动级联删除关联的 messages 和 parts
    await db.delete(chats);
    return { success: true };
  } catch (error) {
    console.error("Error clearing chats:", error);
    return { error: "Failed to clear chat history" };
  }
};
