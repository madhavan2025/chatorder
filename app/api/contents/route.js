import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("floating");

    const contents = await db.collection("contents").find({}).toArray();

    const formatted = contents.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      link: item.link,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Failed to fetch contents:", err);
    return NextResponse.json({ error: "Failed to fetch contents" }, { status: 500 });
  }
}