"use client";

import { createClient } from "../lib/supabase/client";

export default function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-[12px] font-medium text-gray underline-offset-2 hover:underline"
    >
      Sign out
    </button>
  );
}
