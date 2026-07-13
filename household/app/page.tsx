export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl text-ink">Rumah</h1>
      <p className="max-w-sm text-ink-soft">
        Design system wired — Fraunces, General Sans, JetBrains Mono, warm-ledger palette.
      </p>
      <p className="font-mono text-2xl text-gold">Rp 1,234,567</p>
      <div className="flex gap-3">
        <span className="rounded-chip bg-daniel-bg px-3 py-1 text-daniel">Daniel</span>
        <span className="rounded-chip bg-adel-bg px-3 py-1 text-adel">Adel</span>
      </div>
    </main>
  );
}
