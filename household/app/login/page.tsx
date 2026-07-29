"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-[360px]">
        <h1 className="mb-1 font-display text-[26px] font-medium text-ink">Rumah</h1>
        <p className="mb-7 text-sm text-gray">Sign in with a magic link sent to your email.</p>

        {status === "sent" ? (
          <p className="rounded-card border-[0.5px] border-gray-line bg-card px-4 py-3.5 text-sm text-ink-soft">
            Check <b className="font-medium text-ink">{email}</b> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-[12px] border-[0.5px] border-gray-line bg-card px-3.5 py-3 text-[13.5px] text-ink outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && (
              <p className="mt-2.5 text-[12.5px] text-terracotta">{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
