// Server-only helpers for converting between stored image filenames and
// fully-qualified URLs. Merchant.images is persisted as a JSON array of
// bare filenames (e.g. "67abc123.jpg") — API responses expand these into
// full URLs so frontend clients can use them directly.

// Normalise the base URL: strip trailing slashes so we can always join
// with a single "/" without creating double-slash URLs.
const IMG_BASE_URL = (process.env.UPLOAD_IMG_BASE_URL ?? "").replace(/\/+$/, "");

export function toImageFilename(value: string): string {
  if (!value) return value;
  if (IMG_BASE_URL && value.startsWith(IMG_BASE_URL)) {
    return value.slice(IMG_BASE_URL.length).replace(/^\/+/, "");
  }
  return value;
}

export function toImageUrl(filename: string): string {
  if (!filename) return filename;
  if (filename.startsWith("http")) return filename;
  // Strip any accidental leading slashes from stored value before joining.
  const clean = filename.replace(/^\/+/, "");
  return IMG_BASE_URL ? `${IMG_BASE_URL}/${clean}` : clean;
}
