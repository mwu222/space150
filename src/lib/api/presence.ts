// "[N] in their space": who's on space150 right now, using Supabase Realtime Presence.
// Everyone joins one presence channel; the app only shows people who are your friends.
import { sb } from "../supabase";

export interface PresenceState { user_id: string; status: "focusing" | "paused" | "online"; activity?: string; timer_started_at?: string; since: string }

/**
 * Join presence and get the set of online user ids whenever it changes.
 * Call `setStatus("focusing")` when a timer starts and `setStatus("paused")` when it's paused.
 */
export function joinPresence(myId: string, onChange: (online: Map<string, PresenceState>) => void) {
  const ch = sb().channel("space150-presence", { config: { presence: { key: myId } } });
  let status: PresenceState["status"] = "online";
  let since = new Date().toISOString();

  const publish = () => {
    const state = ch.presenceState<PresenceState>();
    const online = new Map<string, PresenceState>();
    for (const [key, metas] of Object.entries(state)) if (metas[0]) online.set(key, metas[0]);
    onChange(online);
  };

  ch.on("presence", { event: "sync" }, publish).subscribe(async (s) => {
    if (s === "SUBSCRIBED") {
      await ch.track({ user_id: myId, status, since: new Date().toISOString() });
      void sb().rpc("touch_presence");
    }
  });

  const beat = setInterval(() => { void sb().rpc("touch_presence"); }, 5 * 60 * 1000);

  return {
    setStatus: async (s: PresenceState["status"], activity?: string) => { if (s !== status) since = new Date().toISOString(); status = s; await ch.track({ user_id: myId, status, activity, since }); },
    leave: () => { clearInterval(beat); void ch.untrack(); sb().removeChannel(ch); },
  };
}

/**
 * Who the lamp should list: friends whose timer is running or paused right now,
 * plus friends seen in the last 30 minutes (from profiles.last_seen_at).
 */
export function lampFriends<F extends { id: string; last_seen_at: string | null; status: string }>(
  friends: F[], online: Map<string, PresenceState>, now = Date.now(),
): (F & { lamp: "focusing" | "paused" | "recent"; minutesAgo?: number })[] {
  const out: (F & { lamp: "focusing" | "paused" | "recent"; minutesAgo?: number })[] = [];
  for (const f of friends) {
    if (f.status !== "accepted") continue;
    const p = online.get(f.id);
    if (p && (p.status === "focusing" || p.status === "paused")) { out.push({ ...f, lamp: p.status }); continue; }
    const seen = f.last_seen_at ? (now - new Date(f.last_seen_at).getTime()) / 60000 : Infinity;
    if (p || seen <= 30) out.push({ ...f, lamp: "recent", minutesAgo: p ? 0 : Math.round(seen) });
  }
  return out;
}
