// The lamp turns on when any friend has the website open, timer or not.
import { expect, it } from "vitest";
import { headerVals } from "../bridges/header";
const ctx = (online: [string, string][]) => ({ current: { social: {
  friends: [{ id: "a", status: "accepted" }, { id: "b", status: "accepted" }, { id: "c", status: "pending" }],
  online: new Map(online.map(([id, status]) => [id, { status, since: new Date().toISOString() }])),
} } }) as any;
it("lamp counts friends with the site open", () => {
  expect(headerVals(ctx([])).lampOff).toBe(true);
  const v = headerVals(ctx([["a", "online"]]));
  expect(v.lampCount).toBe(1); expect(v.lampOff).toBe(false); expect(v.lampInk).toBe("#2B2A27");
  expect(headerVals(ctx([["a", "online"], ["b", "focusing"], ["c", "online"]])).lampCount).toBe(2);
});

it("hover list: only friends online now, focusing first", () => {
  const c = ctx([["b", "focusing"]]);
  c.current.social.friends[0].display_name = "Ana"; c.current.social.friends[0].last_seen_at = new Date(Date.now() - 3 * 3600000).toISOString();
  c.current.social.friends[1].display_name = "Ben";
  const v = headerVals(c);
  expect(v.lampHead).toBe("1 online now");
  expect(v.lampList.map((r) => r.name + ": " + r.when)).toEqual(["Ben: Focusing"]);
});
