import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId, customerId, chatId, qaPairs } = await req.json();

    if (!userId || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("floating");

    const result = await db.collection("chats").updateOne(
      { chatId, userId },
      {
        $set: {
          customerId,
          qaPairs,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("SAVE CHAT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save chat" },
      { status: 500 }
    );
  }
}