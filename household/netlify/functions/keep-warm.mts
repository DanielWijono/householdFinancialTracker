// Pings the Next.js server function every 10 minutes so the first visit of
// the day doesn't pay a cold start.
export default async () => {
  const res = await fetch(`${process.env.URL}/api/warm`, { cache: "no-store" });
  console.log(`keep-warm: ${res.status}`);
};

export const config = { schedule: "*/10 * * * *" };
