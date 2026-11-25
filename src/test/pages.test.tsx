// Every page, desktop and phone, rendered from its design board against a fake backend.
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, fake, ME } from "./fakeSupabase";

vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
afterEach(() => { cleanup(); calls.length = 0; });

const setPhone = (on: boolean) => { window.matchMedia = ((q: string) => ({ matches: on, media: q, addEventListener() {}, removeEventListener() {} })) as any; };
const at = async (path: string) => {
  await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>); });
  await act(async () => { await new Promise((r) => setTimeout(r, 80)); });
};

for (const phone of [false, true]) describe(phone ? "phone" : "desktop", () => {
  it("Home: real tasks, board items and adding a task", async () => {
    setPhone(phone); await at("/");
    expect(screen.getAllByText(/Welcome to your space/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maggie").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Problem set 3").length).toBeGreaterThan(0);
    expect(screen.getByText("Hello board")).toBeTruthy();
    expect(screen.queryByText("Library at 3 tomorrow? Bringing snacks.")).toBeNull();   // no sample posts
    expect(document.body.textContent).not.toMatch(/\[(N|Weekday, date|Name)\]/);          // no design placeholders
    const box = (document.getElementById("newtask") || document.getElementById("newtaskm")) as HTMLInputElement;
    fireEvent.change(box, { target: { value: "Read chapter 5" } });
    fireEvent.keyDown(box, { key: "Enter" });
    const add = screen.queryAllByRole("button").find((b) => b.textContent?.trim() === "ADD");
    if (add) fireEvent.click(add);
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(calls.some((c) => c.table === "tasks" && c.op === "insert")).toBe(true);
  });
  it("Schedule: day, week and month from the backend", async () => {
    setPhone(phone); await at("/schedule");
    expect(screen.getAllByText("Biology lecture").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "WEEK" }));
    expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "MONTH" }));
    expect(screen.getAllByText("Essay due").length).toBeGreaterThan(0);
  });
  it("Study: quizzes and decks from the backend", async () => {
    setPhone(phone); await at("/study");
    expect(screen.getAllByText("Cells quiz").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cell biology").length).toBeGreaterThan(0);
    expect(screen.queryByText("Derivative rules")).toBeNull();   // no sample decks
  });
  it("Login when signed out", async () => {
    setPhone(phone); fake.auth.session = null;
    await at("/");
    expect(screen.getAllByText("Your lamp is waiting.").length).toBeGreaterThan(0);
    fake.auth.session = { user: { id: ME } };
  });
});
