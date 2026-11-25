// A small in-memory stand-in for Supabase, enough to render pages and record writes.
export const ME = "11111111-1111-1111-1111-111111111111";
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const d = new Date(); export const DAY = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const calls: { op: string; table: string; payload?: unknown }[] = [];
export const db: Record<string, any[]> = {
  profiles: [{ id: ME, username: "maggie", display_name: "Maggie", avatar_color: "#FBF3D9", timezone: "America/Toronto", allow_board_posts: true, last_seen_at: null }],
  timer_settings: [{ user_id: ME, countdown_sec: 1500, pomo_focus_sec: 1500, pomo_short_sec: 300, pomo_long_sec: 900, pomo_rounds: 4, auto_break: false, auto_focus: false, sound: true }],
  tasks: [{ id: uuid(1), text: "Problem set 3", done: false, plan_sec: 3000, logged_sec: 1500, pomodoros: 1, position: 0, completed_at: null, created_at: "" }],
  subjects: [{ id: uuid(2), name: "Biology", dot: "#6B8A5E", paper: "#F2F5EE", paper2: "#E6EDE0", position: 0 }],
  quizzes: [{ id: uuid(3), subject_id: uuid(2), name: "Cells quiz", best_score: null, best_total: null, created_at: "", quiz_items: [{ id: uuid(4), position: 0, question: "What is ATP?", answer: "Energy currency" }] }],
  decks: [{ id: uuid(5), subject_id: uuid(2), name: "Cell biology", created_at: "", cards: [{ id: uuid(6), position: 0, front: "Ribosome", back: "Builds proteins", known: false }] }],
  board_items: [{ id: uuid(7), owner_id: ME, author_id: ME, kind: "note", body: "Hello board", caption: null, color: "#D6E8F7", strokes: null, image_path: null, x: 20, y: 20, z: 1, kept: false, expires_at: null, created_at: "" }],
  schedule_items: [{ id: uuid(8), day: DAY, start_min: 540, duration_min: 90, title: "Biology lecture", kind: "class" }],
  task_placements: [{ id: uuid(9), task_id: uuid(1), day: DAY, start_min: 960 }],
  month_items: [{ id: uuid(10), day: DAY, title: "Essay due", kind: "deadline" }],
  schedule_tags: [], day_notes: [], daily_focus: [{ user_id: ME, day: DAY, focus_sec: 600, coins: 0 }], focus_sessions: [],
};
export const rpcs: Record<string, unknown> = { list_friends: [], star_calendar: [], search_profiles: [], username_available: true, save_deck: uuid(50), save_quiz: uuid(51), delete_subject: null, keep_board_item: null, touch_presence: null, is_admin: false, request_access: "pending", list_access_requests: [], decide_access_request: [] };
let n = 100;
function query(table: string) {
  let op = "select", payload: any = null, one = false;
  const q: any = {};
  for (const m of ["eq", "neq", "gte", "lte", "in", "not", "order", "limit", "select"]) q[m] = () => q;
  q.insert = (p: any) => { op = "insert"; payload = p; return q; };
  q.upsert = (p: any) => { op = "upsert"; payload = p; return q; };
  q.update = (p: any) => { op = "update"; payload = p; return q; };
  q.delete = () => { op = "delete"; return q; };
  q.single = () => { one = true; return q; }; q.maybeSingle = q.single;
  q.then = (ok: any, bad: any) => {
    if (op !== "select") calls.push({ op, table, payload });
    let data: any = db[table] ?? [];
    if (op === "insert" || op === "upsert") data = { ...(Array.isArray(payload) ? payload[0] : payload), id: uuid(n++) };
    else if (op === "update" || op === "delete") data = one ? (db[table]?.[0] ?? null) : [];
    else if (one) data = data[0] ?? null;
    return Promise.resolve({ data, error: null }).then(ok, bad);
  };
  return q;
}
const channel = () => { const c: any = {}; c.on = () => c; c.subscribe = (cb?: any) => { cb?.("SUBSCRIBED"); return c; }; c.presenceState = () => ({}); c.track = async () => ({}); c.untrack = async () => ({}); return c; };
export const fake = {
  auth: {
    session: { user: { id: ME } } as any,
    getSession: async () => ({ data: { session: fake.auth.session } }),
    getUser: async () => ({ data: { user: { id: ME } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }), signInWithPassword: async () => ({ data: {}, error: null }), signUp: async (a: any) => { calls.push({ op: "signUp", table: "auth", payload: a }); return { data: { session: null }, error: null }; },
    signInWithOtp: async (a: any) => { calls.push({ op: "otp", table: "auth", payload: a }); return { data: {}, error: null }; },
    updateUser: async (a: any) => { calls.push({ op: "updateUser", table: "auth", payload: a }); if (fake.auth.session?.user) fake.auth.session.user.user_metadata = { ...(fake.auth.session.user.user_metadata || {}), ...(a.data || {}) }; return { data: {}, error: null }; },
    resend: async (a: any) => { calls.push({ op: "resend", table: "auth", payload: a }); return { error: null }; },
  },
  from: (t: string) => query(t),
  rpc: async (name: string, args?: unknown) => { calls.push({ op: "rpc", table: name, payload: args }); return { data: rpcs[name] ?? null, error: null }; },
  channel, removeChannel: async () => {},
  storage: { from: () => ({ createSignedUrl: async () => ({ data: { signedUrl: "x" }, error: null }), upload: async () => ({ data: {}, error: null }), remove: async () => ({}) }) },
};
