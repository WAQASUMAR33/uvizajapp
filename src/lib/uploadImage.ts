/**
 * Uploads an image file to the Next.js /api/upload endpoint,
 * which processes and converts the image to WebP format.
 *
 * @param file - The File object to upload
 * @returns The web-accessible URL of the uploaded WebP image
 */
export async function uploadImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload image");
  }

  const url: string = data.url || (data.filename ? `/uploads/${data.filename}` : "");
  if (!url) {
    throw new Error("No URL returned from upload server");
  }

  return url;
}

/**
 * Uploads a base64 encoded image to the Next.js /api/upload endpoint.
 *
 * @param base64Data - The base64 data string (with or without data: URI prefix)
 * @returns The web-accessible URL of the uploaded WebP image
 */
export async function uploadBase64ImageToServer(base64Data: string): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64Data }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload image");
  }

  const url: string = data.url || (data.filename ? `/uploads/${data.filename}` : "");
  if (!url) {
    throw new Error("No URL returned from upload server");
  }

  return url;
}
