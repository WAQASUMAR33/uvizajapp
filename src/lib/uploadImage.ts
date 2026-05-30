const UPLOAD_API_URL   = process.env.NEXT_PUBLIC_UPLOAD_API_URL!;
const IMG_BASE_URL     = process.env.NEXT_PUBLIC_UPLOAD_IMG_BASE_URL!;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

export function uploadImageToServer(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const ext = MIME_TO_EXT[file.type];
    if (!ext) { reject(new Error("Unsupported file type")); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Use text/plain to avoid CORS preflight — PHP reads php://input regardless
        const res = await fetch(UPLOAD_API_URL, {
          method:  "POST",
          headers: { "Content-Type": "text/plain" },
          body:    JSON.stringify({ image: reader.result, type: ext }),
        });

        const data = await res.json();
        if (data.error) { reject(new Error(data.error)); return; }

        const filename: string = data.image_url ?? "";
        if (!filename) { reject(new Error("No filename returned from server")); return; }

        resolve(filename.startsWith("http") ? filename : `${IMG_BASE_URL}/${filename}`);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
