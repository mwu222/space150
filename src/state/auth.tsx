// Who's signed in, and their profile.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb } from "../lib/supabase";
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

const Ctx = createContext<AuthState>({ session: null, profile: null, loading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try { setProfile(await getMyProfile()); } catch { setProfile(null); }
  }, []);

  useEffect(() => {
    sb().auth.getSession().then(async ({ data }) => {
      if (data.session && shouldForget()) { await sb().auth.signOut(); setLoading(false); return; }
      try { sessionStorage.setItem("space150.open", "1"); } catch { /* ignore */ }
      setSession(data.session);
      if (data.session) await refreshProfile();
      setLoading(false);
    });
    const { data: sub } = sb().auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) void refreshProfile(); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  return <Ctx.Provider value={{ session, profile, loading, refreshProfile }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
