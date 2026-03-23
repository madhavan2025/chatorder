import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 👉 TEMP: store in /public/uploads (for testing)
    const fileName = `${Date.now()}-${file.name}`;
    const path = `./public/uploads/${fileName}`;

    const fs = await import("fs/promises");
    await fs.writeFile(path, buffer);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      pathname: fileName,
      contentType: file.type,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}