import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const { width = 0, height = 0, format = "unknown", size } = metadata;
    const stats = await sharp(buffer).stats();

    const channels = stats.channels;
    const rMean = channels[0]?.mean ?? 128;
    const gMean = channels[1]?.mean ?? 128;
    const bMean = channels[2]?.mean ?? 128;
    const avgBrightness = 0.299 * rMean + 0.587 * gMean + 0.114 * bMean;

    return NextResponse.json({
      width,
      height,
      format,
      size: size ?? file.size,
      channels: channels.length,
      meanR: rMean,
      meanG: gMean,
      meanB: bMean,
      avgBrightness,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
