// Nothing should animate when Home first opens (the star coin plays only when you earn one).
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fake, ME } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
afterEach(() => cleanup());
for (const phone of [false, true]) it("no animation when Home opens (" + (phone ? "phone" : "desktop") + ")", async () => {
  window.matchMedia = ((q: string) => ({ matches: phone, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  await act(async () => { render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>); });
  await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
  const anim = [...document.querySelectorAll<HTMLElement>("*")].filter((e) => e.style.animation && e.style.animation !== "none");
  expect(anim.length).toBe(0);
});
