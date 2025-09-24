import { NextRequest, NextResponse } from "next/server";

import { getChats } from "@/app/chat/lib/db/actions";
import { type Chat } from "@/lib/types";

interface ChatPageResponse {
  chats: Chat[];
  nextOffset: number | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  // const limit = parseInt(searchParams.get('limit') || '20', 10)

  try {
    const result = await getChats();
    return NextResponse.json<ChatPageResponse>({
      chats: result,
      nextOffset: 1,
    });
  } catch (error) {
    console.error("API route error fetching chats:", error);
    return NextResponse.json<ChatPageResponse>(
      { chats: [], nextOffset: null },
      { status: 500 }
    );
  }
}
