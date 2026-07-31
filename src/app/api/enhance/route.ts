import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const adjustmentsStr = formData.get("adjustments") as string | null;

    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });

    const adjustments = adjustmentsStr ? JSON.parse(adjustmentsStr) : {};
    const buffer = Buffer.from(await file.arrayBuffer());

    let pipeline = sharp(buffer);

    // Apply server-side enhancements using Sharp
    if (adjustments.sharpness && adjustments.sharpness > 0) {
      const sigma = 0.5 + (adjustments.sharpness / 100) * 2;
      pipeline = pipeline.sharpen({ sigma });
    }

    if (adjustments.noiseReduction && adjustments.noiseReduction > 0) {
      const strength = Math.ceil(adjustments.noiseReduction / 25);
      pipeline = pipeline.median(strength * 2 + 1);
    }

    const format = formData.get("format") as string || "jpeg";
    const quality = parseInt(formData.get("quality") as string || "90");
    const scale = parseFloat(formData.get("scale") as string || "1");

    if (scale > 1) {
      const meta = await sharp(buffer).metadata();
      const newWidth = Math.round((meta.width || 1920) * scale);
      pipeline = pipeline.resize(newWidth, null, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false,
      });
    }

    let outputBuffer: Buffer;
    if (format === "png") {
      outputBuffer = await pipeline.png({ quality }).toBuffer();
    } else if (format === "webp") {
      outputBuffer = await pipeline.webp({ quality }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
