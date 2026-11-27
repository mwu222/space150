// Who's signed in, and their profile.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb, storedSession, isOfflineError } from "../lib/supabase";
import { getMyProfile } from "../lib/api/auth";
import type { Profile } from "../lib/types";

interface AuthState { session: Session | null; profile: Profile | null; loading: boolean; refreshProfile: () => Promise<void> }
// "Keep me logged in on this device": when unticked, the session ends with the browser session.
export function setRememberMe(on: boolean) {
  try { localStorage.setItem("space150.remember", on ? "1" : "0"); sessionStorage.setItem("space150.open", "1"); } catch { /* private mode */ }
}
function shouldForget(): boolean {
  try { return localStorage.getItem("space150.remember") === "0" && !sessionStorage.getItem("space150.open"); } catch { return false; }
}

function cachedProfile(uid?: string | null): Profile | null {
  try { const p = JSON.parse(localStorage.getItem("space150:profile") || "null"); return p && uid && p.id === uid ? p : null; } catch { return null; }
}

const Ctx = createContext<AuthState>({ session: null, profile: null, loading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // The profile is also kept on this device so the app opens offline.
  const refreshProfile = useCallback(async () => {
    try {
      const p = await getMyProfile(); setProfile(p);
      try { if (p) localStorage.setItem("space150:profile", JSON.stringify(p)); } catch { /* ignore */ }
    } catch (e) {
      if (isOfflineError(e)) setProfile((cur) => cur ?? cachedProfile(storedSession()?.user?.id));
      else setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Signed in before on this device: open straight away with what was kept here
    // (offline, Supabase can't confirm the sign-in until the connection is back).
    const stored = storedSession();
    if (stored && !shouldForget()) {
      const cp = cachedProfile(stored.user.id);
      if (cp) { setSession(stored); setProfile(cp); setLoading(false); }
    }
    sb().auth.getSession().then(async ({ data, error }) => {
      if (!data.session && (error || !navigator.onLine) && stored) data = { session: stored };
      if (data.session && shouldForget()) { await sb().auth.signOut(); setSession(null); setProfile(null); setLoading(false); return; }
      try { sessionStorage.setItem("space150.open", "1"); } catch { /* ignore */ }
      setSession(data.session);
      if (data.session) await refreshProfile(); else setProfile(null);
      setLoading(false);
    });
    const { data: sub } = sb().auth.onAuthStateChange((e, s) => {
      if (!s && e !== "SIGNED_OUT" && storedSession()) return;   // a failed refresh while offline isn't a sign-out
      if (e === "SIGNED_OUT") {   // what was kept for offline use leaves with the person
        try { Object.keys(localStorage).filter((k) => k === "space150:profile" || k.startsWith("space150:study:")).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
      }
      setSession(s);
      if (s) void refreshProfile(); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  return <Ctx.Provider value={{ session, profile, loading, refreshProfile }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
