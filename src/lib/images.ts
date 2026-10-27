// Helpers for converting between stored image filenames/paths and
// fully-qualified URLs. Merchant.images can contain:
// 1) Relative WebP paths like "/uploads/xxx.webp" or "uploads/xxx.webp"
// 2) Bare WebP filenames like "xxx.webp"
// 3) Fully-qualified URLs like "https://..."
// 4) Legacy PHP upload filenames like "67abc123.jpg"

const IMG_BASE_URL = (process.env.UPLOAD_IMG_BASE_URL ?? process.env.NEXT_PUBLIC_UPLOAD_IMG_BASE_URL ?? "").replace(/\/+$/, "");
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

export function toImageFilename(value: string): string {
  if (!value) return value;

  // If value starts with legacy PHP base URL, strip it to bare filename
  if (IMG_BASE_URL && value.startsWith(IMG_BASE_URL)) {
    return value.slice(IMG_BASE_URL.length).replace(/^\/+/, "");
  }

  // If value starts with APP_URL (e.g. https://uvizajapp.vercel.app/uploads/...), normalize to /uploads/...
  if (APP_URL && value.startsWith(APP_URL)) {
    return value.slice(APP_URL.length);
  }

  return value;
}

export function toImageUrl(filename: string): string {
  if (!filename) return filename;

  // Already a full HTTP/HTTPS URL
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }

  const clean = filename.replace(/^\/+/, "");

  // If it's a Next.js upload path or webp file
  if (clean.startsWith("uploads/") || filename.startsWith("/uploads/") || clean.endsWith(".webp")) {
    const relativePath = clean.startsWith("uploads/") ? `/${clean}` : `/uploads/${clean}`;
    return APP_URL ? `${APP_URL}${relativePath}` : relativePath;
  }

  // Fallback for legacy PHP upload server images
  return IMG_BASE_URL ? `${IMG_BASE_URL}/${clean}` : `/${clean}`;
}
