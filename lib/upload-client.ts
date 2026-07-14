/**
 * Persist an image for the admin panel.
 *
 * - If `imageData` is already a hosted URL (http/https), it's returned as-is.
 * - If it's a base64 data URL, we try to upload it to Vercel Blob via /api/upload.
 *   On success we return the hosted URL; if Blob isn't configured (501) or the
 *   request fails, we fall back to the original data URL so saving still works.
 */
export async function persistImage(imageData: string): Promise<string> {
  if (!imageData) return imageData;
  if (/^https?:\/\//i.test(imageData)) return imageData;
  if (!imageData.startsWith("data:")) return imageData;

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: imageData }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url) return data.url as string;
    }
  } catch {
    /* fall through to inline data URL */
  }
  return imageData;
}
