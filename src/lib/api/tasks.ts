// Home → To-do list. Also feeds the Schedule page's Day view.
import { sb, unwrap, myId } from "../supabase";
import type { Task } from "../types";

export async function listTasks(): Promise<Task[]> {
  return unwrap(await sb().from("tasks").select("*").order("done").order("position").order("created_at")) as Task[];
}

/** planMinutes: the "time allocated" chips (25m, 45m, custom…). Leave empty for no plan. */
/** showFrom: a future day (YYYY-MM-DD) — the task stays off the Home list until then. */
export async function addTask(text: string, planMinutes?: number | null, showFrom?: string | null): Promise<Task> {
  const user_id = await myId();
  return unwrap(await sb().from("tasks").insert({
    user_id, text: text.trim(), plan_sec: planMinutes ? Math.round(planMinutes * 60) : null, ...(showFrom ? { show_from: showFrom } : {}),
  }).select().single()) as Task;
}

export async function updateTask(id: string, patch: Partial<Pick<Task, "text" | "done" | "plan_sec" | "position" | "note" | "kind" | "tag_id">>): Promise<Task> {
  return unwrap(await sb().from("tasks").update(patch).eq("id", id).select().single()) as Task;
}

export const toggleTask = (id: string, done: boolean) => updateTask(id, { done });

export async function deleteTask(id: string) {
  unwrap(await sb().from("tasks").delete().eq("id", id));
}

/** Drag-to-reorder: pass ids in their new order. */
export async function reorderTasks(ids: string[]) {
  await Promise.all(ids.map((id, position) => sb().from("tasks").update({ position }).eq("id", id)));
}

/** Live updates, so editing on Home shows up on Schedule (and on other devices) straight away. */
export function onTasksChange(cb: () => void) {
  const ch = sb().channel("tasks-" + Math.random().toString(36).slice(2))
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, cb)
    .subscribe();
  return () => { sb().removeChannel(ch); };
}
