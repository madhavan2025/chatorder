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

   const origin = request.headers.get("origin");
const referer = request.headers.get("referer");

// Use origin first, fallback to referer
const rawSource = origin || referer || "";

if (!rawSource) {
  return NextResponse.json({ error: "Unauthorized (No Source)" }, { status: 403 });
}

// Robust parsing: handles https://sykasys.com/path -> sykasys.com
const domain = rawSource
  .replace(/^https?:\/\//, "") 
  .split("/")[0]               
  .toLowerCase();

console.log("Validating Domain:", domain);

// 5. Domain validation
const allowedDomains = clientData.allowedDomains || [];

const isAllowed = allowedDomains.some((d: string) => {
  // exact match or subdomain (e.g., chat.sykasys.com matches sykasys.com)
  return domain === d.toLowerCase() || domain.endsWith("." + d.toLowerCase());
});

if (!isAllowed) {
  return NextResponse.json(
    { error: `Domain ${domain} not authorized for ${clientId}` },
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