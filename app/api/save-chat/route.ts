import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type QAPair = {
  question: any;
  answer?: any;
};

type ChatDocument = {
  chatId: string;
  userId: string;
  customerId?: string;
  qaPairs: QAPair[];
  createdAt: Date;
  updatedAt: Date;
};

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

    // Make sure qaPairs is always an array
    const qaPairsArray: QAPair[] = Array.isArray(qaPairs) ? qaPairs : [];

    const result = await db.collection<ChatDocument>("chats").updateOne(
      { chatId, userId },
      {
        $set: {
          customerId,
          updatedAt: new Date(),
        },
        // Only push if array exists
        $push: {
          qaPairs: { $each: qaPairs },
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