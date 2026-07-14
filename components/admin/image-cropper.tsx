"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn, Crop as CropIcon, Loader2 } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  src: string | null;
  /** Called with a cropped JPEG data URL, or the original src if crop is skipped. */
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
  /** Default aspect ratio key. */
  defaultAspect?: string;
}

const ASPECTS: { key: string; label: string; value: number | null }[] = [
  { key: "16:9", label: "Wide 16:9", value: 16 / 9 },
  { key: "4:3", label: "Standard 4:3", value: 4 / 3 },
  { key: "1:1", label: "Square 1:1", value: 1 },
  { key: "3:4", label: "Portrait 3:4", value: 3 / 4 },
  { key: "orig", label: "Original", value: null },
];

function isRemote(src: string) {
  return /^https?:\/\//i.test(src);
}

export function ImageCropper({
  open,
  src,
  onConfirm,
  onCancel,
  defaultAspect = "16:9",
}: ImageCropperProps) {
  const [aspectKey, setAspectKey] = useState(defaultAspect);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null
  );

  const aspect = ASPECTS.find((a) => a.key === aspectKey)?.value ?? 16 / 9;

  // Load the image (with CORS for remote sources so canvas export isn't tainted)
  useEffect(() => {
    if (!open || !src) return;
    setReady(false);
    setNat(null);
    setNote("");
    setZoom(1);
    setPos({ x: 0, y: 0 });

    const img = new window.Image();
    if (isRemote(src)) img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNat({ w: img.naturalWidth, h: img.naturalHeight });
      setReady(true);
    };
    img.onerror = () => {
      // Can't load with CORS — fall back to plain load (crop export may be blocked)
      const plain = new window.Image();
      plain.onload = () => {
        imgRef.current = plain;
        setNat({ w: plain.naturalWidth, h: plain.naturalHeight });
        setReady(true);
        setNote("Preview only — remote image may not be croppable.");
      };
      plain.onerror = () => setNote("Could not load this image.");
      plain.src = src;
    };
    img.src = src;
  }, [open, src]);

  const getViewport = () => {
    const el = viewportRef.current;
    if (!el) return { w: 0, h: 0 };
    return { w: el.clientWidth, h: el.clientHeight };
  };

  // Geometry: base scale covers viewport; displayScale adds zoom.
  const geometry = useCallback(() => {
    const { w: vw, h: vh } = getViewport();
    if (!nat || vw === 0 || vh === 0) return null;
    const base = Math.max(vw / nat.w, vh / nat.h);
    const scale = base * zoom;
    const dw = nat.w * scale;
    const dh = nat.h * scale;
    return { vw, vh, scale, dw, dh, base };
  }, [nat, zoom]);

  const clamp = useCallback(
    (p: { x: number; y: number }) => {
      const g = geometry();
      if (!g) return p;
      const minX = Math.min(0, g.vw - g.dw);
      const minY = Math.min(0, g.vh - g.dh);
      return {
        x: Math.max(minX, Math.min(0, p.x)),
        y: Math.max(minY, Math.min(0, p.y)),
      };
    },
    [geometry]
  );

  // Re-center / clamp whenever aspect, zoom or image changes
  useEffect(() => {
    if (!ready) return;
    const g = geometry();
    if (!g) return;
    setPos((prev) => clamp({ x: prev.x || (g.vw - g.dw) / 2, y: prev.y || (g.vh - g.dh) / 2 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, aspectKey, zoom, nat]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setPos(clamp({ x: drag.current.px + dx, y: drag.current.py + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleConfirm = async () => {
    const g = geometry();
    const img = imgRef.current;
    if (!g || !img) {
      if (src) onConfirm(src);
      return;
    }
    setBusy(true);
    try {
      const sx = -pos.x / g.scale;
      const sy = -pos.y / g.scale;
      const sW = g.vw / g.scale;
      const sH = g.vh / g.scale;

      const outW = Math.min(1600, Math.round(sW));
      const outH = Math.round(outW * (g.vh / g.vw));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sW, sH, 0, 0, outW, outH);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      onConfirm(dataUrl);
    } catch {
      // Tainted canvas (remote CORS blocked) — keep original
      setNote("This remote image can't be cropped (CORS). Using original.");
      if (src) onConfirm(src);
    } finally {
      setBusy(false);
    }
  };

  if (!open || !src) return null;

  const g = geometry();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <CropIcon className="h-4 w-4 text-brand" /> Crop image
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close cropper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Aspect ratio buttons */}
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAspectKey(a.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  aspectKey === a.key
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand/40"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Viewport */}
          <div
            ref={viewportRef}
            className="relative w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: String(aspect) }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {!ready && (
              <div className="absolute inset-0 grid place-items-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {ready && nat && g && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="Crop preview"
                draggable={false}
                crossOrigin={isRemote(src) ? "anonymous" : undefined}
                className="absolute top-0 left-0 max-w-none pointer-events-none"
                style={{
                  width: nat.w,
                  height: nat.h,
                  transformOrigin: "0 0",
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${g.scale})`,
                }}
              />
            )}
            {/* Rule-of-thirds guides */}
            {ready && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
              </div>
            )}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-brand"
              aria-label="Zoom"
            />
          </div>

          <p className="text-xs text-slate-400">
            Drag the image to reposition • use the slider to zoom.
            {note && <span className="block text-amber-600 mt-1">{note}</span>}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!ready || busy}
            className="bg-brand hover:bg-brand-dark text-white"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
