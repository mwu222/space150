// Values for the page header the boards share: today's date, the lamp, and its hover list of friends.
import type { Ctx } from "./ctx";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHOW = 6;

function ago(iso: string | null | undefined, now: number) {
  if (!iso) return "Not online yet";
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 2) return "Last online just now";
  if (m < 60) return "Last online " + m + " min ago";
  if (m < 1440) return "Last online " + Math.round(m / 60) + " h ago";
  const d = Math.round(m / 1440);
  return d < 30 ? "Last online " + d + (d === 1 ? " day ago" : " days ago") : "Last online over a month ago";
}

export function headerVals(ctx?: { current: Ctx }) {
  const d = new Date(), now = Date.now();
  const online = ctx?.current.social.online;
  const friends = ctx?.current.social.friends.filter((f) => f.status === "accepted") ?? [];
  // The lamp is on while any friend has the website open.
  const rows = friends.map((f) => {
    const p = online?.get(f.id);
    const rank = p?.status === "focusing" ? 0 : p?.status === "paused" ? 1 : p ? 2 : 3;
    const when = rank === 0 ? "Focusing" : rank === 1 ? "Timer paused" : rank === 2 ? "Online now" : ago(f.last_seen_at, now);
    const dot = rank === 0 ? "#E8A838" : rank === 1 ? "#F2D59A" : rank === 2 ? "#8FB07E" : "#6B655A";
    return { name: f.display_name, when, dot, whenFg: rank < 3 ? "#E3DDD0" : "#A39C8E", rank, seen: f.last_seen_at ? new Date(f.last_seen_at).getTime() : 0 };
  }).sort((a, b) => a.rank - b.rank || b.seen - a.seen || String(a.name || "").localeCompare(String(b.name || "")));
  // Only friends who are online now are listed.
  const live = rows.filter((r) => r.rank < 3);
  const lampCount = live.length;
  const extra = Math.max(0, live.length - SHOW);
  // Hover panel on Schedule/Study: the same people as Home's friends list (online now, or here in the last 30 min).
  const hm = (m: number) => (m >= 60 ? Math.floor(m / 60) + "h " + (m % 60) + "m" : m + "m");
  const panel = friends.map((f) => {
    const p = online?.get(f.id);
    const seenMin = f.last_seen_at ? Math.round((now - new Date(f.last_seen_at).getTime()) / 60000) : Infinity;
    const act = p?.status === "focusing" ? "running" : p?.status === "paused" ? "paused" : p ? "online" : seenMin <= 30 ? "recent" : "away";
    const mins = p ? Math.max(0, Math.round((now - new Date(p.since).getTime()) / 60000)) : 0;
    return { f, act, mins, seenMin };
  }).filter((x) => x.act !== "away")
    .sort((a, b) => ["running", "paused", "online", "recent"].indexOf(a.act) - ["running", "paused", "online", "recent"].indexOf(b.act));
  const lampRows = panel.map(({ f, act, mins, seenMin }) => ({
    name: f.display_name, initial: ((f.display_name || "?").replace(/[^\p{L}]/gu, "").charAt(0) || "?").toUpperCase(), tint: f.avatar_color || "#FBF3D9",
    nameColor: act === "recent" ? "#6B655A" : "#2B2A27",
    status: act === "running" ? "Focusing · " + hm(mins) + " in" : act === "paused" ? "Paused · " + hm(mins) + " in" : act === "online" ? "Online now" : "Active " + seenMin + " min ago",
    note: act === "running" ? "Focused on work · timer going" : act === "paused" ? "Timer paused" : act === "online" ? "Not focusing · no timer going" : "Not online right now",
    noteFg: act === "running" ? "#9A6A12" : "#8A8478",
    dot: act === "running" ? "#E8A838" : act === "paused" ? "#F2D59A" : act === "online" ? "#8FB07E" : "#C9C2B4",
    glow: act === "running" ? "0 0 6px 2px rgba(232, 168, 56, 0.55)" : "none",
  }));
  return {
    lampRows, lampNone: lampRows.length === 0,
    lampSub: panel.filter((x) => x.act !== "recent").length + " online · " + panel.filter((x) => x.act === "running").length + " focused on work",
    todayLabel: DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate(), lampCount,
    lampOff: lampCount === 0, lampOn: lampCount > 0, lampGlow: lampCount ? 1 : 0, lampInk: lampCount ? "#2B2A27" : "#A39C8E",
    lampTip: true, lampHead: lampCount + " online now",
    lampList: live.slice(0, SHOW).map(({ name, when, dot, whenFg }) => ({ name, when, dot, whenFg })),
    lampMoreOn: extra > 0, lampMore: "+ " + extra + " more " + (extra === 1 ? "friend" : "friends"),
  };
}
