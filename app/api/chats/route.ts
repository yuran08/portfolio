import { NextRequest, NextResponse } from "next/server";

import { getChats, getTotalChatsCount } from "@/app/chat/lib/db/actions";
import { type Chat } from "@/lib/types";

interface ChatPageResponse {
  chats: Chat[];
  nextOffset: number | null;
  total: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const [chats, totalCount] = await Promise.all([
      getChats(limit, offset),
      getTotalChatsCount(),
    ]);

    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;

    return NextResponse.json<ChatPageResponse>({
      chats,
      nextOffset,
      total: totalCount,
    });
  } catch (error) {
    console.error("API route error fetching chats:", error);
    return NextResponse.json<ChatPageResponse>(
      { chats: [], nextOffset: null, total: 0 },
      { status: 500 }
    );
  }
}
