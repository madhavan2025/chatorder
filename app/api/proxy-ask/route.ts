import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const ALLOWED_CLIENT_ID = "client-d";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, parentOrigin } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }

    if (clientId !== ALLOWED_CLIENT_ID) {
      return NextResponse.json({ error: "Client not allowed" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("floating");

    const clientData = await db.collection("clients").findOne({ clientId });

    if (!clientData) {
      return NextResponse.json({ error: "Invalid clientId" }, { status: 403 });
    }

    // ✅ Use ACTUAL request origin (more secure)
    const requestOrigin = request.headers.get("origin") || "";
    const domain = requestOrigin
      ? new URL(requestOrigin).hostname
      : new URL(parentOrigin || "").hostname;

    const allowedDomains = clientData.allowedDomains || [];

    const isAllowed =
      allowedDomains.length === 0 ||
      allowedDomains.includes(domain);

    if (!isAllowed) {
      return NextResponse.json(
        { error: `Domain not allowed: ${domain}` },
        { status: 403 }
      );
    }

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