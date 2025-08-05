import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error("ML model error");
    }

    const result = await response.json();

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
