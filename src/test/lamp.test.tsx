// The lamp: grey when no friend is online; hovering shows the friends list on every page.
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fake, ME } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
afterEach(() => cleanup());
const visible = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].filter((t) => t.closest("[style*='display: none']") === null);
const at = async (path: string, phone = false) => {
  window.matchMedia = ((q: string) => ({ matches: phone, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  await act(async () => { render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>); });
  await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
};

for (const phone of [false, true]) for (const path of ["/schedule", "/study"]) it("hover panel " + path + (phone ? " phone" : " desktop"), async () => {
  await at(path, phone);
  const wrap = visible(".lampwrap")[0];
  expect(wrap.querySelector("svg")!.getAttribute("stroke")).toBe("#A39C8E");
  const panel = wrap.querySelector(".lamptip")!;
  expect(panel.textContent).toContain("Friends");
  expect(panel.textContent).toContain("None of your friends are online right now.");
});

for (const phone of [false, true]) it("Home: hovering the lamp opens the friends list" + (phone ? " (phone)" : ""), async () => {
  await at("/", phone);
  const wrap = visible(".lampwrap")[0];
  expect(wrap.querySelector(".lamptip")).toBeNull();
  fireEvent.mouseEnter(wrap); await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
  expect(screen.getByRole("dialog", { name: "Your friends" })).toBeTruthy();
  // the click that follows a tap on touch screens keeps it open
  await act(async () => { (wrap.querySelector("button") as HTMLElement).click(); await new Promise((r) => setTimeout(r, 30)); });
  expect(screen.getByRole("dialog", { name: "Your friends" })).toBeTruthy();
  fireEvent.mouseLeave(wrap); await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
  expect(screen.queryByRole("dialog", { name: "Your friends" })).toBeNull();
});

for (const path of ["/schedule", "/study"]) it("clicking the lamp opens the friends list on Home " + path, async () => {
  await at(path);
  const btn = visible(".lampwrap .lampbtn")[0];
  await act(async () => { btn.click(); await new Promise((r) => setTimeout(r, 150)); });
  expect(document.querySelector('[role="dialog"][aria-label="Your friends"]')).toBeTruthy();
});
