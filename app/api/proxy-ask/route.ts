import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const ALLOWED_CLIENT_ID = "client-d"; // 🔒 hard lock

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId } = body;

    // ❌ 1. Missing clientId
    if (!clientId) {
      return NextResponse.json(
        { error: "Missing clientId" },
        { status: 400 }
      );
    }

    // 🔒 2. HARD CLIENT RESTRICTION
    if (clientId !== ALLOWED_CLIENT_ID) {
      return NextResponse.json(
        { error: "Client not allowed" },
        { status: 403 }
      );
    }

    // 3. Connect DB (optional now, but keeping for future)
    const client = await clientPromise;
    const db = client.db("floating");

    const clientData = await db
      .collection("clients")
      .findOne({ clientId });

    if (!clientData) {
      return NextResponse.json(
        { error: "Invalid clientId" },
        { status: 403 }
      );
    }

    // 4. Extract domain
const origin = request.headers.get("origin") || request.headers.get("referer") || "";

// If it's an embed, we might need to rely on the referer if origin is null
const isEmbed = request.headers.get("x-embed") === "true" || request.url.includes("embed=true");

// RELAXED CHECK: If it's a known embed and we have a referer, allow it
if (!origin && !isEmbed) {
  return NextResponse.json({ error: "Unauthorized (no origin)" }, { status: 403 });
}

// Ensure we strip the path from referer if origin is missing
const domainSource = origin || origin; 
const domain = domainSource
  .replace(/^https?:\/\//, "")
  .split("/")[0]
  .toLowerCase();

    // 5. Domain validation
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

    // 6. Call external API
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