// Heuristic parsing of OCR'd receipt text (Indonesian + English receipts).

const STRONG_TOTAL = /(GRAND\s*TOTAL|TOTAL\s*BAYAR|TOTAL\s*BELANJA|TOTAL\s*PEMBAYARAN|AMOUNT\s*DUE|TOTAL\s*DUE)/i;
const TOTAL = /(TOTAL|JUMLAH|TAGIHAN|AMOUNT)/i;
const EXCLUDE =
  /(SUB\s*-?\s*TOTAL|TUNAI|CASH|KEMBALI|CHANGE|DISKON|DISC|POTONGAN|PPN|TAX|PAJAK|HEMAT|SERVICE|ITEM|QTY|POIN|POINT|DEBIT|KREDIT|CREDIT|EDC|BCA|MANDIRI|BRI|BNI|QRIS|OVO|GOPAY|DANA)/i;

// Matches amounts like 125.000 / 125,000 / Rp125.000,00 / 1.250.000 / 45000
const AMOUNT_RE = /\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{2})?(?!\d)|\d{4,}(?:[.,]\d{2})?(?!\d)/g;

export function parseAmount(token: string): number | null {
  let t = token.replace(/\s/g, "");
  // Drop a trailing 2-digit decimal part (",00" / ".00").
  t = t.replace(/[.,]\d{2}$/, "");
  const digits = t.replace(/[.,]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  const n = Number(digits);
  return n > 0 ? n : null;
}

// Dates (09/10/2026, 2026-10-09, 09.10.26) and times would otherwise read as amounts.
const DATE_TIME_RE =
  /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b|\b\d{4}[/.-]\d{1,2}[/.-]\d{1,2}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b/g;

function normalizeLine(line: string): string {
  return (
    line
      .replace(DATE_TIME_RE, " ")
      // OCR often spaces out separators: "109, 000. 00" → "109,000.00"
      .replace(/(\d)\s*([.,])\s*(?=\d)/g, "$1$2")
  );
}

function amountsIn(line: string): number[] {
  return (normalizeLine(line).match(AMOUNT_RE) ?? [])
    .map(parseAmount)
    .filter((n): n is number => n !== null && n >= 100 && n < 1_000_000_000);
}

export function parseReceiptTotal(text: string): number | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Keyword lines; the amount may sit on the same line or the next one.
  const pick = (re: RegExp): number | null => {
    let found: number | null = null;
    lines.forEach((line, i) => {
      if (!re.test(line) || EXCLUDE.test(line)) return;
      const nums = amountsIn(line);
      const next = i + 1 < lines.length ? amountsIn(lines[i + 1]) : [];
      const n = nums.length ? nums[nums.length - 1] : next[0];
      if (n) found = n; // last match wins
    });
    return found;
  };

  const strong = pick(STRONG_TOTAL);
  if (strong) return strong;
  const total = pick(TOTAL);
  if (total) return total;

  // Fallback: largest amount in the bottom half, ignoring payment/change lines.
  const bottom = lines.slice(Math.floor(lines.length / 2));
  const candidates = bottom.filter((l) => !EXCLUDE.test(l)).flatMap(amountsIn);
  return candidates.length ? Math.max(...candidates) : null;
}

const MERCHANT_SKIP =
  /(JL\.?|JALAN|NPWP|TELP|TEL\b|PHONE|NO\.|STRUK|RECEIPT|INVOICE|NOTA|KASIR|CASHIER|TANGGAL|DATE|WWW|HTTP|@|\d{2}[/-]\d{2})/i;

export type OcrLine = { text: string; confidence?: number };

// Below this, Tesseract line text is usually garbled (e.g. a logo read as "HEAT Ri,").
const MIN_MERCHANT_CONFIDENCE = 75;

export function parseMerchant(input: string | OcrLine[]): string | null {
  const lines = (typeof input === "string" ? input.split(/\r?\n/).map((text): OcrLine => ({ text })) : input)
    .map((l) => ({ ...l, text: l.text.trim() }))
    .filter((l) => l.text);
  for (const { text: line, confidence } of lines.slice(0, 8)) {
    if (confidence !== undefined && confidence < MIN_MERCHANT_CONFIDENCE) continue;
    if (MERCHANT_SKIP.test(line)) continue;
    const letters = (line.match(/[A-Za-z]/g) ?? []).length;
    if (letters < 3 || letters / line.replace(/\s/g, "").length < 0.6) continue;
    const cleaned = line.replace(/[^A-Za-z0-9&'.\- ]/g, "").replace(/\s+/g, " ").trim();
    if (cleaned.length < 3) continue;
    return cleaned
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 40);
  }
  return null;
}

// A price column value: 20,000.00 / 29.000 / 0.00
const PRICE_RE = /\d{1,3}(?:[.,]\d{3})*[.,]\d{2}(?!\d)|\d{1,3}(?:[.,]\d{3})+(?!\d)/;

const trimJunk = (s: string) => s.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "").replace(/\s+/g, " ");
// A real word, not OCR noise from icons/thumbnails ("iG", "P|", "or").
const hasWord = (s: string) => /[A-Za-z]{3,}/.test(s);
const QTY_RE = /(?:^|\s)[x×]\s?(\d{1,3})\s*$/i;

// Item lines sit above the total.
// Paper receipts: "<name> <qty> <price> ..." on one line → "<name> <qty>".
// App receipts (Shopee etc.): name, "x2" and "Rp63.750" on separate lines → "<name> x2";
// consecutive variants of one product collapse to "<name> — SEDANG x2, BRA x1".
export function parseItems(text: string): string[] {
  const items: { name: string; detail: string; variant: boolean }[] = [];
  let pendingName: string | null = null;
  let pendingQty: string | null = null;
  let pendingVariant: string | null = null;
  const flush = (name: string) => {
    // Thumbnail labels can leak in as the first word ("Sedang NANVAN ..." with variant SEDANG).
    const words = name.split(" ");
    if (pendingVariant && words.length > 1 && words[0].toLowerCase() === pendingVariant.toLowerCase()) words.shift();
    const detail = [pendingVariant, pendingQty && `x${pendingQty}`].filter(Boolean).join(" ");
    items.push({ name: words.join(" "), detail, variant: !!pendingVariant });
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = normalizeLine(raw.trim());
    if (!line) continue;
    if ((TOTAL.test(line) || STRONG_TOTAL.test(line)) && !/SUB\s*-?\s*TOTAL/i.test(line)) break;
    if (EXCLUDE.test(line)) continue;
    const m = PRICE_RE.exec(line);
    if (!m) {
      const qty = QTY_RE.exec(line);
      if (qty) {
        pendingQty = qty[1];
        // Variant sits left of the qty ("SEDANG x2"); drop noise tokens like "5" or "—=".
        const variant = line.slice(0, qty.index).split(/\s+/).filter(hasWord).join(" ");
        pendingVariant = variant || null;
        continue;
      }
      const letters = (line.match(/[A-Za-z]/g) ?? []).length;
      if (letters >= 5 && letters / line.replace(/\s/g, "").length >= 0.6) {
        // Drop leading OCR noise tokens, then a trailing ellipsis from truncated names.
        const words = line.split(/\s+/);
        while (words.length && !hasWord(words[0])) words.shift();
        pendingName = trimJunk(words.join(" ").replace(/(\.{2,}|…)$/, ""));
        pendingQty = null;
        pendingVariant = null;
      }
      continue;
    }
    const name = trimJunk(line.slice(0, m.index).replace(/Rp\s*$/i, ""));
    if (hasWord(name)) items.push({ name, detail: "", variant: false });
    else if (pendingName) flush(pendingName);
    else continue;
    pendingName = null;
    pendingQty = null;
    pendingVariant = null;
  }

  const groups: { name: string; details: string[]; variant: boolean }[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && it.detail && last.details.length && last.name === it.name) {
      last.details.push(it.detail);
      last.variant ||= it.variant;
    } else {
      groups.push({ name: it.name, details: it.detail ? [it.detail] : [], variant: it.variant });
    }
  }
  return groups.map(({ name, details, variant }) =>
    !details.length ? name : `${name}${variant || details.length > 1 ? " — " : " "}${details.join(", ")}`,
  );
}
