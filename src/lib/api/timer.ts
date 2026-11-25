// Home → Timer (Countdown, Pomodoro, Stopwatch) and the star coin calendar.
import { sb, unwrap, myId, localDay } from "../supabase";
import type { FocusSessionInput, StarDay, TimerSettings } from "../types";

export const SECONDS_PER_COIN = 4 * 60 * 60;

export async function getTimerSettings(): Promise<TimerSettings> {
  const id = await myId();
  return unwrap(await sb().from("timer_settings").select("*").eq("user_id", id).single()) as TimerSettings;
}

export async function saveTimerSettings(patch: Partial<Omit<TimerSettings, "user_id">>): Promise<TimerSettings> {
  const id = await myId();
  return unwrap(await sb().from("timer_settings").update(patch).eq("user_id", id).select().single()) as TimerSettings;
}

/**
 * Save a finished stretch of timing. Call it when a Pomodoro phase ends, or when a
 * countdown/stopwatch is paused, finished or switched to another task.
 * The database adds focus time to the task and to today's star coin total.
 */
export async function logFocus(s: FocusSessionInput) {
  if (s.seconds < 1) return;
  const user_id = await myId();
  unwrap(await sb().from("focus_sessions").insert({
    user_id,
    task_id: s.task_id ?? null,
    mode: s.mode,
    phase: s.mode === "pomodoro" ? (s.phase ?? "focus") : "focus",
    day: localDay(s.started_at),
    started_at: s.started_at.toISOString(),
    seconds: Math.round(s.seconds),
  }));
}

/** Focus seconds and coins for one day (default today). */
export async function focusForDay(day: string = localDay()): Promise<{ focus_sec: number; coins: number }> {
  const id = await myId();
  const row = unwrap(await sb().from("daily_focus").select("focus_sec, coins").eq("user_id", id).eq("day", day).maybeSingle());
  return (row as { focus_sec: number; coins: number } | null) ?? { focus_sec: 0, coins: 0 };
}

/** Star coin calendar for a month (month is 1–12). Days with no focus are left out. */
export async function starCalendar(year: number, month: number): Promise<StarDay[]> {
  return unwrap(await sb().rpc("star_calendar", { p_year: year, p_month: month })) as StarDay[];
}

/** True when this session pushed today over a 4-hour boundary — play the star animation. */
export function earnedCoin(beforeSec: number, afterSec: number): boolean {
  return Math.floor(afterSec / SECONDS_PER_COIN) > Math.floor(beforeSec / SECONDS_PER_COIN);
}
