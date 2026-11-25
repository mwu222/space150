// Friends list + live presence, shared by the lamp, the Friends pop-up and the whiteboard.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { listFriends, onFriendshipsChange } from "../lib/api/friends";
import { joinPresence, lampFriends, type PresenceState } from "../lib/api/presence";
import type { Friend } from "../lib/types";
import { useAuth } from "./auth";

type TimerStatus = "focusing" | "paused" | "online";
interface Social {
  friends: Friend[]; online: Map<string, PresenceState>; reloadFriends: () => Promise<void>;
  setTimerStatus: (s: TimerStatus, activity?: string) => void;
  lamp: ReturnType<typeof lampFriends<Friend>>;
  nameOf: (id: string) => string;
}
const Ctx = createContext<Social | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [online, setOnline] = useState<Map<string, PresenceState>>(new Map());
  const pres = useRef<ReturnType<typeof joinPresence> | null>(null);
  const [tick, setTick] = useState(0);

  const reloadFriends = useCallback(async () => { try { setFriends(await listFriends()); } catch { /* offline */ } }, []);

  useEffect(() => {
    if (!session) return;
    void reloadFriends();
    const off = onFriendshipsChange(() => void reloadFriends());
    pres.current = joinPresence(session.user.id, setOnline);
    const iv = setInterval(() => setTick((t) => t + 1), 60_000);   // refresh "x min ago"
    return () => { off(); pres.current?.leave(); pres.current = null; clearInterval(iv); };
  }, [session, reloadFriends]);

  const setTimerStatus = useCallback((s: TimerStatus, activity?: string) => {
    if (!pres.current) return;
    void pres.current.setStatus(s, activity);
  }, []);

  const value = useMemo<Social>(() => ({
    friends, online, reloadFriends, setTimerStatus,
    lamp: lampFriends(friends, online),
    nameOf: (id: string) => id === profile?.id ? profile.display_name : friends.find((f) => f.id === id)?.display_name ?? "A friend",
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [friends, online, reloadFriends, setTimerStatus, profile, tick]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useSocial() { const v = useContext(Ctx); if (!v) throw new Error("useSocial outside SocialProvider"); return v; }
