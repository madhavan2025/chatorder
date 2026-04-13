import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId } = body;

    // ✅ 1. Validate clientId
    if (!clientId) {
      return NextResponse.json(
        { error: "Missing clientId" },
        { status: 400 }
      );
    }

    // ✅ 2. Connect DB
    const client = await clientPromise;
    const db = client.db("floating"); // ⚠️ use your DB name

    const clientData = await db
      .collection("clients") // ⚠️ your collection name
      .findOne({ clientId });

    if (!clientData) {
      return NextResponse.json(
        { error: "Invalid clientId" },
        { status: 403 }
      );
    }

    // ✅ 3. Extract domain
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      "";

    if (!origin) {
      return NextResponse.json(
        { error: "Unauthorized request (no origin)" },
        { status: 403 }
      );
    }

    const domain = origin
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .toLowerCase();

    // ✅ 4. Validate domain
    const allowedDomains = clientData.allowedDomains || [];

    const isAllowed = allowedDomains.some((d: string) => {
      return domain === d || domain.endsWith("." + d);
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: `Domain not allowed: ${domain}` },
        { status: 403 }
      );
    }

    // ✅ 5. Call external API
    const response = await fetch(
      "https://faqact-knowledge-service-htc7fpb5apaxaha5.uksouth-01.azurewebsites.net/api/knowledge/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error) {
    console.error("Proxy API error:", error);

    return NextResponse.json(
      { error: "Proxy API error" },
      { status: 500 }
    );
  }
}