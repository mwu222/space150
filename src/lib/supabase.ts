// One shared Supabase client for the whole app.
// Set these in your front end's env file (.env.local):
//   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY   (Vite)
//   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY   (Next.js)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return client;
}

export function sb(): SupabaseClient {
  if (!client) throw new Error("Call initSupabase(url, anonKey) once when the app starts.");
  return client;
}

/** Throws the Supabase error so callers can just `await` and catch. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<R extends { data: unknown; error: any }>(res: R): Extract<R, { error: null }>["data"] {
  if (res.error) throw new Error(res.error.message ?? String(res.error));
  return res.data as Extract<R, { error: null }>["data"];
}

export async function myId(): Promise<string> {
  const { data } = await sb().auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/** Local calendar day as YYYY-MM-DD (star coins and the schedule use the user's own day). */
export function localDay(d: Date = new Date()): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
