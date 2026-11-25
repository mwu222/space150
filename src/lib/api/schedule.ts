// Schedule page: Day (to-do tasks placed on a timeline), Week (own items + notes), Month (all-day items).
import { sb, unwrap, myId } from "../supabase";
import type { DayNote, ItemKind, MonthItem, ScheduleItem, ScheduleTag, TaskPlacement } from "../types";

// ── Week items (also shown on Day view) ──
export async function listScheduleItems(from: string, to: string): Promise<ScheduleItem[]> {
  return unwrap(await sb().from("schedule_items").select("*").gte("day", from).lte("day", to).order("day").order("start_min")) as ScheduleItem[];
}
export async function addScheduleItem(i: { day: string; start_min: number; duration_min: number; title: string; kind: ItemKind; tag_id?: string | null }) {
  const user_id = await myId();
  return unwrap(await sb().from("schedule_items").insert({ user_id, ...i, title: i.title.trim() }).select().single()) as ScheduleItem;
}
/** Editing (name, start, length, type) and dragging (day, start) both use this. */
export async function updateScheduleItem(id: string, patch: Partial<Omit<ScheduleItem, "id">>) {
  return unwrap(await sb().from("schedule_items").update(patch).eq("id", id).select().single()) as ScheduleItem;
}
export async function deleteScheduleItem(id: string) {
  unwrap(await sb().from("schedule_items").delete().eq("id", id));
}

// ── To-do tasks placed on a day ──
export async function listPlacements(from: string, to: string): Promise<TaskPlacement[]> {
  return unwrap(await sb().from("task_placements").select("*").gte("day", from).lte("day", to)) as TaskPlacement[];
}
/** Drop a task on a day. If it's already on that day it moves instead of duplicating. */
export async function placeTask(task_id: string, day: string, start_min: number) {
  const user_id = await myId();
  return unwrap(await sb().from("task_placements")
    .upsert({ user_id, task_id, day, start_min }, { onConflict: "task_id,day" })
    .select().single()) as TaskPlacement;
}
/** Drag a placed task to another time and/or day (Week view). */
export async function movePlacement(id: string, task_id: string, day: string, start_min: number) {
  await sb().from("task_placements").delete().eq("task_id", task_id).eq("day", day).neq("id", id);
  return unwrap(await sb().from("task_placements").update({ day, start_min }).eq("id", id).select().single()) as TaskPlacement;
}
export async function unplaceTask(id: string) {
  unwrap(await sb().from("task_placements").delete().eq("id", id));
}

// ── Month items ──
export async function listMonthItems(from: string, to: string): Promise<MonthItem[]> {
  return unwrap(await sb().from("month_items").select("*").gte("day", from).lte("day", to).order("day")) as MonthItem[];
}
export async function addMonthItem(i: { day: string; title: string; kind: ItemKind; tag_id?: string | null }) {
  const user_id = await myId();
  return unwrap(await sb().from("month_items").insert({ user_id, ...i, title: i.title.trim() }).select().single()) as MonthItem;
}
/** Changing a month item's type (e.g. its tag was deleted). */
export async function updateMonthItem(id: string, patch: Partial<Omit<MonthItem, "id">>) {
  return unwrap(await sb().from("month_items").update(patch).eq("id", id).select().single()) as MonthItem;
}
export async function deleteMonthItem(id: string) {
  unwrap(await sb().from("month_items").delete().eq("id", id));
}

// ── Week notes (one per day) ──
export async function listNotes(from: string, to: string): Promise<DayNote[]> {
  return unwrap(await sb().from("day_notes").select("day, body").gte("day", from).lte("day", to)) as DayNote[];
}
/** Call this debounced (e.g. 600 ms after typing stops). */
export async function saveNote(day: string, body: string) {
  const user_id = await myId();
  unwrap(await sb().from("day_notes").upsert({ user_id, day, body }, { onConflict: "user_id,day" }));
}

// ── Custom tags ("+ New tag" in the Schedule pop-up) ──
export async function listTags(): Promise<ScheduleTag[]> {
  return unwrap(await sb().from("schedule_tags").select("id,label,color").order("created_at")) as ScheduleTag[];
}
export async function addTag(label: string, color: number): Promise<ScheduleTag> {
  const user_id = await myId();
  return unwrap(await sb().from("schedule_tags").insert({ user_id, label: label.trim(), color }).select("id,label,color").single()) as ScheduleTag;
}
/** Items that used the tag become "Other". */
export async function deleteTag(id: string) {
  unwrap(await sb().from("schedule_tags").delete().eq("id", id));
}
