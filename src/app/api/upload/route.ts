import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_SIZE_MB = 15;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);

export async function POST(req: NextRequest) {
  try {
    let inputBuffer: Buffer | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = (formData.get("file") || formData.get("image")) as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: "Unsupported image format. Allowed: JPEG, PNG, WebP, GIF, AVIF" },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_SIZE_MB} MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      inputBuffer = Buffer.from(bytes);
    } else {
      // JSON or plain text base64 payload
      const text = await req.text();
      let base64Data = "";

      try {
        const json = JSON.parse(text);
        base64Data = json.image || json.file || "";
      } catch {
        base64Data = text;
      }

      if (!base64Data) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }

      // Strip data URI scheme prefix if present (e.g. data:image/png;base64,...)
      let pureBase64 = base64Data.trim();
      const commaIdx = pureBase64.indexOf(",");
      if (pureBase64.startsWith("data:") && commaIdx !== -1) {
        pureBase64 = pureBase64.slice(commaIdx + 1);
      }

      inputBuffer = Buffer.from(pureBase64, "base64");
      if (inputBuffer.length > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_SIZE_MB} MB.` },
          { status: 400 }
        );
      }
    }

    if (!inputBuffer || inputBuffer.length === 0) {
      return NextResponse.json({ error: "Empty image received" }, { status: 400 });
    }

    // Convert and optimize image to WebP using Sharp
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(inputBuffer)
        .rotate() // auto-orient based on EXIF tags
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    } catch (sharpErr: any) {
      console.error("Sharp WebP conversion error:", sharpErr);
      return NextResponse.json(
        { error: "Failed to process image. Ensure the file is a valid image." },
        { status: 422 }
      );
    }

    // Ensure public/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique WebP filename
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(6).toString("hex");
    const filename = `${timestamp}-${randomHex}.webp`;
    const filePath = path.join(uploadDir, filename);

    // Save WebP image to disk
    await fs.promises.writeFile(filePath, webpBuffer);

    // Calculate URLs
    const relativeUrl = `/uploads/${filename}`;
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const appBaseUrl = host
      ? `${proto}://${host}`
      : (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");

    const fullUrl = appBaseUrl ? `${appBaseUrl}${relativeUrl}` : relativeUrl;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fullUrl,
      filename,
      image_url: filename,
      size: webpBuffer.length,
      format: "webp",
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
