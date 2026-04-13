import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const ALLOWED_CLIENT_ID = "client-d"; // 🔒 hard lock

export async function POST(request: Request) {
  try {
    // ✅ 1. Parse body ONCE
    const body = await request.json();
    const { clientId, parentOrigin } = body;

    // ❌ Missing clientId
    if (!clientId) {
      return NextResponse.json(
        { error: "Missing clientId" },
        { status: 400 }
      );
    }

    // 🔒 2. Hard client restriction
    if (clientId !== ALLOWED_CLIENT_ID) {
      return NextResponse.json(
        { error: "Client not allowed" },
        { status: 403 }
      );
    }

    // 3. DB check
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

    // 🔥 4. Extract domain safely from parentOrigin
    const domain = parentOrigin
      ? new URL(parentOrigin).hostname
      : "";

    // 5. Domain validation
    const allowedDomains = clientData.allowedDomains || [];

    const isAllowed =
      allowedDomains.length === 0 ||
      allowedDomains.some((d: string) =>
        domain === d || domain.endsWith("." + d)
      );

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