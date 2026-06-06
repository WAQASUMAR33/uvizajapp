// Server-only helpers for converting between stored image filenames and
// fully-qualified URLs. Merchant.images is persisted as a JSON array of
// bare filenames (e.g. "67abc123.jpg") — API responses expand these into
// full URLs so frontend clients can use them directly.

const IMG_BASE_URL = process.env.UPLOAD_IMG_BASE_URL ?? "";

// Only collapse URLs that point at our own upload server down to a bare
// filename — external URLs (e.g. seed/demo images from other hosts) are
// left untouched so they keep resolving correctly.
export function toImageFilename(value: string): string {
  if (!value) return value;
  if (IMG_BASE_URL && value.startsWith(IMG_BASE_URL)) {
    return value.slice(IMG_BASE_URL.length).replace(/^\/+/, "");
  }
  return value;
}

export function toImageUrl(filename: string): string {
  if (!filename) return filename;
  return filename.startsWith("http") ? filename : `${IMG_BASE_URL}/${filename}`;
}
