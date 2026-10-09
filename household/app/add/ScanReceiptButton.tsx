"use client";

import { useRef, useState } from "react";
import { parseItems, parseMerchant, parseReceiptTotal } from "../../lib/receipt-ocr";

const MAX_EDGE = 1600;

function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap> {
  if (isHeic(file)) {
    try {
      return await createImageBitmap(file); // Safari decodes natively
    } catch {
      // Chrome/Firefox can't decode HEIC (iPhone photos): convert to PNG via libheif (wasm).
      const { heicTo } = await import("heic-to/next");
      const png = await heicTo({ blob: file, type: "image/png" });
      return createImageBitmap(png);
    }
  }
  return createImageBitmap(file);
}

// Downscale + grayscale before OCR: faster, and Tesseract reads cleaner contrast.
async function preprocess(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await decode(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "grayscale(1) contrast(1.3)";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

export default function ScanReceiptButton({
  onResult,
}: {
  onResult: (r: { amount: number | null; note: string | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [scan, setScan] = useState<{ text: string; confidence: number } | null>(null);

  async function handleFile(file: File) {
    setError("");
    setProgress(0);
    try {
      const canvas = await preprocess(file);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(["ind", "eng"], 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(canvas);
      await worker.terminate();
      const amount = parseReceiptTotal(data.text);
      const items = parseItems(data.text);
      const note = items.length
        ? items.join(". ")
        : parseMerchant(data.lines.map((l) => ({ text: l.text, confidence: l.confidence })));
      console.groupCollapsed(`Receipt OCR — confidence ${Math.round(data.confidence)}%`);
      console.table(data.lines.map((l) => ({ text: l.text.trim(), confidence: Math.round(l.confidence) })));
      console.log("Parsed:", { amount, note });
      console.groupEnd();
      setScan({ text: data.text, confidence: Math.round(data.confidence) });
      onResult({ amount, note });
    } catch (err) {
      console.error("Receipt scan failed", err);
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Couldn't read that image (${detail}). Try again or enter manually.`);
    } finally {
      setProgress(null);
    }
  }

  const busy = progress !== null;

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-[12px] border-[0.5px] border-ink/40 bg-card py-2.5 text-[13px] font-medium text-ink disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        {busy ? `Reading receipt… ${progress}%` : "Scan receipt"}
      </button>
      {error && <p className="mt-1.5 text-center text-[12px] text-terracotta">{error}</p>}
      {scan && (
        <details className="mt-1.5 text-[12px] text-gray">
          <summary className="cursor-pointer text-center">
            Show scanned text ({scan.confidence}% confidence)
          </summary>
          <pre className="mt-1.5 max-h-60 overflow-auto whitespace-pre-wrap rounded-[10px] bg-card p-2.5 font-mono text-[11px] text-ink">
            {scan.text || "(no text recognised)"}
          </pre>
        </details>
      )}
    </div>
  );
}
