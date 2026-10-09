import { describe, expect, it } from "vitest";
import { parseAmount, parseItems, parseMerchant, parseReceiptTotal } from "./receipt-ocr";

describe("parseAmount", () => {
  it("handles Indonesian formats", () => {
    expect(parseAmount("125.000")).toBe(125000);
    expect(parseAmount("125,000")).toBe(125000);
    expect(parseAmount("125.000,00")).toBe(125000);
    expect(parseAmount("1.250.000")).toBe(1250000);
    expect(parseAmount("45000")).toBe(45000);
  });
});

describe("parseReceiptTotal", () => {
  it("Indomaret: ignores tunai/kembali", () => {
    const text = `INDOMARET
JL. SUDIRMAN NO 12
INDOMIE GORENG 5 3.100 15.500
AQUA 600ML 2 3.500 7.000
HARGA JUAL : 22.500
TOTAL : 22.500
TUNAI : 50.000
KEMBALI : 27.500`;
    expect(parseReceiptTotal(text)).toBe(22500);
  });

  it("Alfamart: total belanja preferred over subtotal", () => {
    const text = `alfamart
Sub Total 48.900
Total Belanja 46.900
Hemat 2.000
Tunai 100.000
Kembalian 53.100`;
    expect(parseReceiptTotal(text)).toBe(46900);
  });

  it("Restaurant with PPN + service: grand total wins", () => {
    const text = `KOPI KENANGAN
Latte 2 x 25.000 50.000
Subtotal 50.000
Service 5% 2.500
PPN 11% 5.775
Grand Total Rp 58.275`;
    expect(parseReceiptTotal(text)).toBe(58275);
  });

  it("comma decimals and amount on next line", () => {
    const text = `HERO SUPERMARKET
TOTAL
Rp125.000,00
CASH 150.000,00`;
    expect(parseReceiptTotal(text)).toBe(125000);
  });

  it("falls back to largest bottom amount", () => {
    const text = `WARUNG BU SRI
nasi 15.000
ayam 20.000
es teh 5.000
40.000`;
    expect(parseReceiptTotal(text)).toBe(40000);
  });

  it("ignores dates and times", () => {
    const text = `WARUNG BU SRI
nasi 15.000
ayam 20.000
09.10.2026 19:42
09/10/2026
40.000`;
    expect(parseReceiptTotal(text)).toBe(40000);
  });

  it("handles OCR-spaced separators (real Platerie scan)", () => {
    const text = `HEAT Ri,
PLATERIE |
Invoice i ja
: Nama Produk Qty Harga transaksi 1
BAZAAR 20K 4 20, 000. 00 a SA
BWL MINI DMO 1 29, 000. 00 |
BWL MINI DMO 1 0.00 Be
Nilai Total 109, 000. 00 |
| Diskon 0. 00
| Total Belanja 109, 000. 00
"1 2026-10-09 15:26:40 KS`;
    expect(parseReceiptTotal(text)).toBe(109000);
  });

  it("returns null when nothing found", () => {
    expect(parseReceiptTotal("hello world")).toBeNull();
  });
});

describe("parseMerchant", () => {
  it("takes first letter-heavy line, skipping address", () => {
    expect(parseMerchant("PT INDOMARCO PRISMATAMA\nJL. SUDIRMAN 12")).toBe(
      "Pt Indomarco Prismatama",
    );
    expect(parseMerchant("12/03/2026 10:22\nKOPI KENANGAN\nJl Kemang")).toBe("Kopi Kenangan");
  });

  it("skips low-confidence lines (real Platerie scan)", () => {
    const lines = [
      { text: "HEAT Ri,", confidence: 41 },
      { text: "SERING", confidence: 52 },
      { text: "& SE AE \"UUPA. 74", confidence: 30 },
      { text: "PLATERIE |", confidence: 88 },
      { text: "Invoice i ja", confidence: 80 },
    ];
    expect(parseMerchant(lines)).toBe("Platerie");
  });
});

describe("parseItems", () => {
  it("extracts name + qty above the total (real Platerie scan)", () => {
    const text = `HEAT Ri,
PLATERIE |
Invoice i ja
: Nama Produk Qty Harga transaksi 1
BAZAAR 20K 4 20, 000. 00 a SA
BWL MINI DMO 1 29, 000. 00 |
BWL MINI DMO 1 0.00 Be
Nilai Total 109, 000. 00 |
Produk i“
| Diskon 0. 00
| Total Belanja 109, 000. 00`;
    expect(parseItems(text)).toEqual(["BAZAAR 20K 4", "BWL MINI DMO 1", "BWL MINI DMO 1"]);
  });

  it("app receipt: name, qty and price on separate lines (real Shopee scan)", () => {
    const text = `LocknLock Feelbuy Indonesia
DISKON KHUSUS LIVE 50% Tonton Sekarang
P| is LocknLock Round Food Container 1.9L...
or —- x2
2
iG Rp91.000 Rp63.750
Total Pesanan: Rp123.325
Dengan VIP, kamu sudah hemat Rp8.500.`;
    expect(parseItems(text)).toEqual(["LocknLock Round Food Container 1.9L x2"]);
    expect(parseReceiptTotal(text)).toBe(123325);
  });

  it("app receipt: groups variants, drops thumbnail label (real Shopee scan)", () => {
    const text = `Nanvan Official Store Selesai
| Sedang NANVAN NVN-WNO1 Kantong Jaring L...
5 SEDANG x2

= i
Rp20.000Rp13.500
Bn NANVAN NVN-WNO1 Kantong Jaring L...
—= BRA x1

|

Rp20.000Rp16.500
Besar NANVAN NVN-WNO1 Kantong Jaring L...
——— BESAR x1
- Rp20.000 Rp15.500
Total 4 produk: Rp55.947`;
    expect(parseItems(text)).toEqual(["NANVAN NVN-WNO1 Kantong Jaring L — SEDANG x2, BRA x1, BESAR x1"]);
    expect(parseReceiptTotal(text)).toBe(55947);
  });
});
