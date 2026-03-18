import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const themeName = searchParams.get("theme");
    const userId = searchParams.get("userId"); // ✅ dynamic

    const client = await clientPromise;
    const db = client.db("floating");

    // 🎯 Fetch all required data
    const [defaultTheme, darkTheme, userAgent] = await Promise.all([
      db.collection("ChatThemes").findOne({ name: "default" }),
      db.collection("ChatThemes").findOne({ name: "darkTheme" }),
      userId
        ? db.collection("agents").findOne({ userId })
        : null,
    ]);

    let finalTheme: any = {};

    // 🌙 DARK MODE
    if (themeName === "darkTheme") {
      finalTheme = {
        ...(darkTheme?.theme || {}),
        agentName: userAgent?.agentName || defaultTheme?.agentName,
        agentIcon: userAgent?.agentIcon || defaultTheme?.agentIcon,
        agentFont: userAgent?.agentFont || defaultTheme?.agentFont,
        enableShopping:
          userAgent?.enableShopping ?? defaultTheme?.enableShopping,
      };
    } else {
      // ☀️ LIGHT MODE
      if (userAgent) {
        finalTheme = {
          ...(userAgent.theme || {}),
          agentName: userAgent.agentName,
          agentIcon: userAgent.agentIcon,
          agentFont: userAgent.agentFont,
          enableShopping: userAgent.enableShopping,
        };
      } else {
        finalTheme = {
          ...(defaultTheme?.theme || {}),
          agentName: defaultTheme?.agentName,
          agentIcon: defaultTheme?.agentIcon,
          agentFont: defaultTheme?.agentFont,
          enableShopping: defaultTheme?.enableShopping,
        };
      }
    }

    return NextResponse.json({
      ...finalTheme,

      // ✅ UI mappings
      chatIcon: finalTheme.agentIcon,
      chatIconSize: 56,
      chatIconBg: "#ffffff",
    });
  } catch (err) {
    console.error("Failed to fetch theme:", err);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}