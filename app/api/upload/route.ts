import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

/**
 * Image upload endpoint backed by Vercel Blob.
 *
 * Accepts either:
 *   - JSON: { dataUrl: "data:image/...;base64,....", filename?: string }
 *   - multipart/form-data with a `file` field
 *
 * Returns { url } pointing at the hosted Blob object.
 *
 * If BLOB_READ_WRITE_TOKEN is not configured, responds 501 with code
 * "NO_BLOB" so the client can fall back to storing the image inline.
 */
export async function POST(req: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob is not configured. Add a Blob store and set BLOB_READ_WRITE_TOKEN.",
        code: "NO_BLOB",
      },
      { status: 501 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let bytes: Buffer;
    let filename = `image-${Date.now()}`;
    let mime = "image/jpeg";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const dataUrl: string = body.dataUrl || body.imageData || "";
      const match = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
      if (!match) {
        return NextResponse.json(
          { error: "Expected a base64 data URL." },
          { status: 400 }
        );
      }
      mime = match[1];
      bytes = Buffer.from(match[2], "base64");
      if (typeof body.filename === "string" && body.filename) {
        filename = body.filename;
      }
    } else {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 }
        );
      }
      mime = file.type || mime;
      filename = file.name || filename;
      bytes = Buffer.from(await file.arrayBuffer());
    }

    if (!mime.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 }
      );
    }
    // Guard against oversized payloads (~8MB of raw bytes)
    if (bytes.byteLength > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image is too large (max 8MB)." },
        { status: 413 }
      );
    }

    const ext = (mime.split("/")[1] || "jpg").split("+")[0];
    const base = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `site-images/${base || "image"}.${ext}`;

    const blob = await put(key, bytes, {
      access: "public",
      contentType: mime,
      token,
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
