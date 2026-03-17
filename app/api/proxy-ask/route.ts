import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy API error:", error);
    return NextResponse.json({ error: "Proxy API error" }, { status: 500 });
  }
}