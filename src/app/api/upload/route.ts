import { NextRequest, NextResponse } from "next/server";

// PHP only accepts jpg/jpeg/png/gif — it extracts type from the data URI prefix
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/gif":  "gif",
};
const MAX_SIZE_MB    = 5;
const PHP_UPLOAD_URL = process.env.UPLOAD_API_URL!;
const IMG_BASE_URL   = process.env.UPLOAD_IMG_BASE_URL!;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_TYPES[file.type])
    return NextResponse.json({ error: "Only JPEG, PNG, and GIF are allowed" }, { status: 400 });

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE_MB} MB)` }, { status: 400 });

  // Build the full data URI — PHP extracts the type from the prefix via regex
  const bytes   = await file.arrayBuffer();
  const base64  = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  // Send JSON body — PHP reads php://input and json_decodes it
  // Only send `image`; PHP does not use a separate `type` field
  let phpRes: Response;
  try {
    phpRes = await fetch(PHP_UPLOAD_URL, {
      method:  "POST",
      headers: {
        "Content-Type":   "application/json",
        "User-Agent":     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":         "application/json, text/plain, */*",
        "Accept-Language":"en-US,en;q=0.9",
        "Referer":        "https://uzivaj.rizwancars.com/",
        "Origin":         "https://uzivaj.rizwancars.com",
      },
      body: JSON.stringify({ image: dataUri }),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach upload server" }, { status: 502 });
  }

  const text = await phpRes.text();

  if (text.trimStart().startsWith("<")) {
    return NextResponse.json(
      { error: `Upload server blocked the request (HTTP ${phpRes.status}). Whitelist the upload URL in your hosting bot-protection settings.` },
      { status: 502 }
    );
  }

  let json: Record<string, string>;
  try { json = JSON.parse(text); } catch {
    return NextResponse.json(
      { error: `Unexpected response from upload server: ${text.slice(0, 200)}` },
      { status: 502 }
    );
  }

  if (json.error)
    return NextResponse.json({ error: json.error }, { status: 502 });

  // PHP returns just the filename e.g. "67abc123.jpg"
  // Prepend the base URL to get the full accessible URL
  const filename = json.image_url;
  if (!filename)
    return NextResponse.json({ error: "No filename returned from upload server" }, { status: 502 });

  const imageUrl = filename.startsWith("http")
    ? filename
    : `${IMG_BASE_URL}/${filename}`;

  return NextResponse.json({ url: imageUrl });
}
