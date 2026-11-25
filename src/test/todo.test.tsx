// To-do add (button + Enter), week pop-up text, Enter-to-save and custom tags.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, db, fake, ME } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
let errors: unknown[] = [];
beforeEach(() => { errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); }); window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any; });
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); });
const wait = (ms = 80) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const at = async (path: string) => { await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>); }); await wait(); };
const inserts = (table: string) => calls.filter((c) => c.table === table && c.op === "insert").map((c) => c.payload as any);

it("adds a to-do with the ADD button and with Enter", async () => {
  await at("/");
  const inp = document.getElementById("newtask") as HTMLInputElement;
  fireEvent.change(inp, { target: { value: "Read ch 4" } });
  fireEvent.click(inp.parentElement!.querySelector("button")!); await wait();
  fireEvent.change(inp, { target: { value: "Lab report" } });
  fireEvent.keyDown(inp, { key: "Enter" }); await wait();
  expect(inserts("tasks").map((p) => p.text)).toEqual(["Read ch 4", "Lab report"]);
  // No planned time unless one is picked.
  expect(inserts("tasks").map((p) => p.plan_sec ?? null)).toEqual([null, null]);
  expect(screen.getByRole("button", { name: "No time" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getAllByText("Lab report").length).toBeGreaterThan(0);
  expect(inp.value).toBe("");
  expect(errors).toEqual([]);
});

it("week pop-up: real apostrophe, Enter saves, custom tag is created and used", async () => {
  await at("/schedule");
  fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
  const col = document.querySelector(".weekcol") as HTMLElement;
  col.getBoundingClientRect = () => ({ top: 0, left: 0, right: 100, bottom: 960, width: 100, height: 960, x: 0, y: 0, toJSON() {} }) as DOMRect;
  fireEvent.click(col, { clientY: 300 });
  const name = screen.getByPlaceholderText("What’s happening?") as HTMLInputElement;
  expect(document.body.innerHTML).not.toContain("\\u20");
  fireEvent.click(screen.getByRole("button", { name: "+ New tag" }));
  const tag = screen.getByLabelText("New tag name");
  fireEvent.change(tag, { target: { value: "Gym" } });
  fireEvent.keyDown(tag, { key: "Enter" }); await wait();
  expect(inserts("schedule_tags")).toEqual([expect.objectContaining({ label: "Gym", user_id: ME })]);
  expect(screen.getByRole("button", { name: "Gym" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.change(name, { target: { value: "Leg day" } });
  fireEvent.keyDown(name, { key: "Enter" }); await wait();
  const item = inserts("schedule_items")[0];
  expect(item).toMatchObject({ title: "Leg day", kind: "other" });
  expect(item.tag_id).toMatch(/^0000/);
  expect(screen.queryByPlaceholderText("What’s happening?")).toBeNull();
  expect(errors).toEqual([]);
});

it("adding a to-do task from the week pop-up saves the placement", async () => {
  db.tasks.push({ id: "00000000-0000-0000-0000-0000000000e1", text: "Read ch 5", done: false, plan_sec: 1800, logged_sec: 0, pomodoros: 0, position: 4, completed_at: null, created_at: "" });
  await at("/schedule");
  fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
  const today = new Date().getDay();
  const col = document.querySelectorAll(".weekcol")[today] as HTMLElement;
  col.getBoundingClientRect = () => ({ top: 0, left: 0, right: 100, bottom: 960, width: 100, height: 960, x: 0, y: 0, toJSON() {} }) as DOMRect;
  fireEvent.click(col, { clientY: 300 });
  expect(document.querySelector('button[aria-label^="Add Problem set 3"]')).toBeNull();   // already on the schedule
  fireEvent.click(document.querySelector('button[aria-label^="Add Read ch 5"]')!); await wait(200);
  expect(calls.filter((c) => c.table === "task_placements" && c.op === "upsert").length).toBe(1);
  db.tasks.pop();
  expect(errors).toEqual([]);
});

it("the to-do list stays in the tray on later days; a task leaves it once scheduled", async () => {
  db.tasks.push({ id: "00000000-0000-0000-0000-0000000000e2", text: "Read ch 6", done: false, plan_sec: 1800, logged_sec: 0, pomodoros: 0, position: 6, completed_at: null, created_at: "" });
  await at("/schedule");
  const tray = () => document.querySelector('section[aria-label="Tasks to schedule"]')!.textContent || "";
  expect(tray()).not.toContain("Problem set 3");          // already dragged onto today
  expect(tray()).toContain("Read ch 6");
  fireEvent.click(screen.getByRole("button", { name: "Next day" })); await wait();
  expect(tray()).toContain("Read ch 6");                  // still there, ready to drag onto this day
  expect(tray()).not.toContain("Problem set 3");
  const inp = screen.getByLabelText("New task for this day") as HTMLInputElement;
  fireEvent.change(inp, { target: { value: "Return library books" } });
  fireEvent.keyDown(inp, { key: "Enter" }); await wait();
  expect(tray()).toContain("Return library books");
  fireEvent.click(screen.getByRole("button", { name: "Next day" })); await wait();
  expect(tray()).toContain("Return library books");      // and on the days after
  expect(tray()).toContain("Read ch 6");
  fireEvent.click(screen.getByRole("button", { name: "Previous day" })); await wait();
  fireEvent.click(screen.getByRole("button", { name: "Previous day" })); await wait();
  expect(tray()).not.toContain("Return library books");   // not before its day
  expect(tray()).toContain("Read ch 6");
  db.tasks.pop();
});

it("built-in tags can be deleted from the edit pop-up (Other stays)", async () => {
  await at("/schedule");
  fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
  fireEvent.click(document.querySelector('[data-wblock]') as HTMLElement); await wait();
  expect(screen.queryByRole("button", { name: "Delete the Other tag" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Delete the Class tag" })); await wait(600);
  expect(screen.queryByRole("button", { name: "Class" })).toBeNull();
  expect(calls.some((c) => c.table === "profiles" && c.op === "update" && JSON.stringify((c.payload as any).hidden_kinds) === '["class"]')).toBe(true);
  expect(calls.some((c) => c.table === "schedule_items" && c.op === "update" && (c.payload as any).kind === "other")).toBe(true);
  expect(errors).toEqual([]);
});

it("crossed-off tasks move to the bottom; the small × deletes a task", async () => {
  await at("/");
  const inp = document.getElementById("newtask") as HTMLInputElement;
  fireEvent.change(inp, { target: { value: "Lab report" } });
  fireEvent.keyDown(inp, { key: "Enter" }); await wait();
  const names = () => [...document.querySelectorAll('button[aria-label^="Delete "]')].map((b) => b.getAttribute("aria-label"));
  expect(names()).toEqual(["Delete Problem set 3", "Delete Lab report"]);
  fireEvent.click(screen.getByLabelText("Mark Problem set 3 done", { selector: "input" }) ?? screen.getAllByRole("checkbox")[0]); await wait();
  expect(names()).toEqual(["Delete Lab report", "Delete Problem set 3"]);
  fireEvent.click(screen.getByRole("button", { name: "Delete Problem set 3" })); await wait();
  expect(names()).toEqual(["Delete Lab report"]);
  expect(calls.some((c) => c.table === "tasks" && c.op === "delete")).toBe(true);
  expect(errors).toEqual([]);
});

it("month items show on the day and week views; month form can add and delete tags", async () => {
  await at("/schedule");
  // fake data has "Essay due" on today in the month calendar
  expect(screen.getByRole("button", { name: /Essay due, Deadline, all day/ })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "WEEK" })); await wait();
  expect(screen.getAllByRole("button", { name: /Essay due, Deadline, all day/ }).length).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "MONTH" })); await wait();
  const menuBtn = screen.getByRole("button", { name: /^Tag: .*Change tag$/ });
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.click(menuBtn); await wait();
  expect(screen.getByRole("listbox", { name: "Tags" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "+ New tag" }));
  const tag = screen.getByLabelText("New tag name");
  fireEvent.change(tag, { target: { value: "Trip" } });
  fireEvent.keyDown(tag, { key: "Enter" }); await wait();
  expect(calls.some((c) => c.table === "schedule_tags" && c.op === "insert" && (c.payload as any).label === "Trip")).toBe(true);
  expect(screen.getByRole("option", { name: /Trip/ }).getAttribute("aria-selected")).toBe("true");
  expect(menuBtn.textContent).toContain("Trip");
  fireEvent.click(screen.getByRole("button", { name: "Delete the Trip tag" })); await wait();
  expect(screen.queryByRole("option", { name: /Trip/ })).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: /Social/ })); await wait();
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(menuBtn.textContent).toContain("Social");
  expect(calls.some((c) => c.table === "schedule_tags" && c.op === "delete")).toBe(true);
  expect(errors).toEqual([]);
});

it("tasks added on a future day in the Schedule wait for that day on Home", async () => {
  const tomorrow = new Date(Date.now() + 86400000); const iso = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  db.tasks.push({ id: "00000000-0000-0000-0000-0000000000f1", text: "Future reading", done: false, plan_sec: 1800, logged_sec: 0, pomodoros: 0, position: 5, completed_at: null, created_at: "", show_from: iso(tomorrow) });
  await at("/");
  expect(screen.queryByText("Future reading")).toBeNull();
  cleanup();
  await at("/schedule");
  expect(screen.queryByText("Future reading")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next day" })); await wait();
  expect(screen.getAllByText("Future reading").length).toBeGreaterThan(0);
  const inp = screen.getByLabelText("New task for this day") as HTMLInputElement;
  fireEvent.change(inp, { target: { value: "Too long" } });
  fireEvent.change(screen.getByLabelText("Hours"), { target: { value: "1.5" } });
  expect((screen.getByLabelText("Hours") as HTMLInputElement).value).toBe("1");
  fireEvent.change(screen.getByLabelText("Minutes"), { target: { value: "75" } });
  expect(screen.getByRole("alert").textContent).toContain("Minutes can’t be more than 60.");
  fireEvent.keyDown(inp, { key: "Enter" }); await wait();
  expect(inserts("tasks")).toEqual([]);
  fireEvent.change(screen.getByLabelText("Minutes"), { target: { value: "15" } });
  expect(screen.queryByRole("alert")).toBeNull();
  fireEvent.change(inp, { target: { value: "Pack lab coat" } });
  fireEvent.keyDown(inp, { key: "Enter" }); await wait();
  expect(inserts("tasks")).toEqual([expect.objectContaining({ text: "Pack lab coat", plan_sec: 4500, show_from: iso(tomorrow) })]);
  expect(screen.getAllByText("Pack lab coat").length).toBeGreaterThan(0);
  db.tasks.pop();
  expect(errors).toEqual([]);
});

it("tapping a task on the day schedule opens a pop-up to edit it and add a note", async () => {
  await at("/schedule");
  const block = [...document.querySelectorAll<HTMLElement>('[data-block]')].find((b) => b.textContent?.includes("Problem set 3"))!;
  if (!(window as any).PointerEvent) (window as any).PointerEvent = class extends MouseEvent { pointerId = 1; };
  fireEvent.pointerDown(block, { clientY: 100 }); fireEvent.pointerUp(block); await wait();
  expect(screen.getByRole("dialog", { name: "Edit to-do task" })).toBeTruthy();
  fireEvent.change(screen.getByPlaceholderText("Add a note to this task"), { target: { value: "Questions 4–9 only" } });
  fireEvent.click(screen.getByRole("button", { name: "SAVE" })); await wait(600);
  const upd = calls.find((c) => c.table === "tasks" && c.op === "update" && (c.payload as any).note);
  expect((upd!.payload as any).note).toBe("Questions 4–9 only");
  expect(block.textContent).toContain("✎ note");
  expect(errors).toEqual([]);
});

it("the to-do task pop-up can set, add and clear a tag", async () => {
  await at("/schedule");
  if (!(window as any).PointerEvent) (window as any).PointerEvent = class extends MouseEvent { pointerId = 1; };
  const open = async () => { const b = [...document.querySelectorAll<HTMLElement>('[data-block]')].find((x) => x.textContent?.includes("Problem set 3"))!; fireEvent.pointerDown(b, { clientY: 100 }); fireEvent.pointerUp(b); await wait(); return b; };
  await open();
  const dlg = screen.getByRole("dialog", { name: "Edit to-do task" });
  fireEvent.click(within(dlg).getByRole("button", { name: /^Deadline/ })); await wait();
  fireEvent.click(within(dlg).getByRole("button", { name: "SAVE" })); await wait(600);
  let upd = calls.filter((c) => c.table === "tasks" && c.op === "update").pop()!;
  expect(upd.payload).toEqual(expect.objectContaining({ kind: "deadline", tag_id: null }));
  const block = await open();
  expect(block.textContent).toContain("Deadline");
  const dlg2 = screen.getByRole("dialog", { name: "Edit to-do task" });
  expect(within(dlg2).getByRole("button", { name: /^Deadline/ }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(within(dlg2).getByRole("button", { name: "+ New tag" })); await wait();
  const nm = screen.getByLabelText("New tag name");
  fireEvent.change(nm, { target: { value: "Lab" } });
  fireEvent.keyDown(nm, { key: "Enter" }); await wait(300);
  expect(within(dlg2).getByRole("button", { name: /^Lab/ }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(within(dlg2).getByRole("button", { name: "SAVE" })); await wait(600);
  upd = calls.filter((c) => c.table === "tasks" && c.op === "update").pop()!;
  expect((upd.payload as any).kind).toBe("other");
  expect((upd.payload as any).tag_id).toMatch(/^[0-9a-f-]{36}$/);
  await open();
  const dlg3 = screen.getByRole("dialog", { name: "Edit to-do task" });
  fireEvent.click(within(dlg3).getByRole("button", { name: /^Lab/ })); await wait();
  fireEvent.click(within(dlg3).getByRole("button", { name: "SAVE" })); await wait(600);
  upd = calls.filter((c) => c.table === "tasks" && c.op === "update").pop()!;
  expect(upd.payload).toEqual(expect.objectContaining({ kind: null, tag_id: null }));
  expect(errors).toEqual([]);
});
