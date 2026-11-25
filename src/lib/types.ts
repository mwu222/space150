// Row shapes, matching supabase/migrations. (You can replace this file with
// `supabase gen types typescript` output once the project is linked.)
export type TimerMode = "countdown" | "pomodoro" | "stopwatch";
export type TimerPhase = "focus" | "short_break" | "long_break";
export type ItemKind = "class" | "social" | "deadline" | "other";
export type BoardKind = "note" | "drawing" | "photo";

export interface Profile {
  id: string; username: string; display_name: string; avatar_color: string;
  timezone: string; allow_board_posts: boolean; last_seen_at: string | null;
  /** Built-in Schedule tags the user deleted ('class' | 'social' | 'deadline'). */
  hidden_kinds?: ItemKind[];
}
export interface TimerSettings {
  user_id: string; countdown_sec: number; pomo_focus_sec: number; pomo_short_sec: number;
  pomo_long_sec: number; pomo_rounds: number; auto_break: boolean; auto_focus: boolean; sound: boolean;
}
export interface Subject { id: string; name: string; dot: string; paper: string; paper2: string; position: number }
export interface Task {
  id: string; text: string; done: boolean; plan_sec: number | null; logged_sec: number;
  pomodoros: number; position: number; completed_at: string | null; created_at: string; show_from?: string | null; note?: string | null; kind?: ItemKind | null; tag_id?: string | null;
}
export interface FocusSessionInput {
  task_id?: string | null; mode: TimerMode; phase?: TimerPhase; started_at: Date; seconds: number;
}
export interface StarDay { day: string; focus_sec: number; coins: number }

export interface ScheduleItem { id: string; day: string; start_min: number; duration_min: number; title: string; kind: ItemKind; tag_id?: string | null }
export interface TaskPlacement { id: string; task_id: string; day: string; start_min: number }
export interface MonthItem { id: string; day: string; title: string; kind: ItemKind; tag_id?: string | null }
export interface DayNote { day: string; body: string }

export interface QuizItem { question: string; answer: string }
export interface Quiz {
  id: string; subject_id: string; name: string; best_score: number | null; best_total: number | null;
  created_at: string; quiz_items?: (QuizItem & { id: string; position: number })[];
}
export interface Card { front: string; back: string; known?: boolean }
export interface Deck {
  id: string; subject_id: string; name: string; created_at: string;
  cards?: (Card & { id: string; position: number; known: boolean })[];
}

export interface Friend {
  id: string; username: string; display_name: string; avatar_color: string; last_seen_at: string | null;
  allow_board_posts: boolean; status: "pending" | "accepted"; incoming: boolean;
}
export interface ProfileSearchResult {
  id: string; username: string; display_name: string; avatar_color: string;
  relation: "friend" | "requested" | "incoming" | "none";
}

export interface Stroke { color: string; width: number; points: [number, number][] }
export interface BoardItem {
  id: string; owner_id: string; author_id: string; kind: BoardKind;
  body: string | null; caption: string | null; color: string | null; strokes: Stroke[] | null; image_path: string | null;
  x: number; y: number; z: number; kept: boolean; expires_at: string | null; created_at: string;
}

/** A user's own tag for week/month items; color is an index into the board's tag palette (0–5). */
export interface ScheduleTag { id: string; label: string; color: number }
