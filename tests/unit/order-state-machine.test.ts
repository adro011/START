import { describe, expect, it } from "vitest";
import { ORDER_TRANSITIONS, canTransition } from "@/lib/order-state-machine";

// Legal transitions mirror order_transitions (migration 0010):
// pending → confirmed|cancelled; confirmed → packed|cancelled;
// packed → shipped; shipped → delivered|returned; delivered → returned.
const LEGAL: Array<[string, string]> = [
  ["pending", "confirmed"],
  ["pending", "cancelled"],
  ["confirmed", "packed"],
  ["confirmed", "cancelled"],
  ["packed", "shipped"],
  ["shipped", "delivered"],
  ["shipped", "returned"],
  ["delivered", "returned"],
];

const ILLEGAL: Array<[string, string]> = [
  // skipping steps
  ["pending", "packed"],
  ["pending", "shipped"],
  ["pending", "delivered"],
  ["confirmed", "delivered"],
  ["packed", "delivered"],
  // backwards / sideways
  ["confirmed", "pending"],
  ["packed", "confirmed"],
  ["shipped", "packed"],
  ["delivered", "shipped"],
  ["delivered", "pending"],
  ["cancelled", "pending"],
  ["cancelled", "confirmed"],
  ["returned", "shipped"],
  ["returned", "delivered"],
  // same-state writes are not transitions
  ["pending", "pending"],
  ["shipped", "shipped"],
];

describe("canTransition (src/lib/order-state-machine)", () => {
  it.each(LEGAL)("allows %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each(ILLEGAL)("rejects %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("treats cancelled and returned as terminal", () => {
    const targets = Object.keys(ORDER_TRANSITIONS);
    for (const from of ["cancelled", "returned"]) {
      for (const to of targets) {
        expect(canTransition(from, to), `${from} → ${to}`).toBe(false);
      }
    }
  });

  it("covers every schema status", () => {
    const statuses = Object.keys(ORDER_TRANSITIONS).sort();
    expect(statuses).toEqual(
      ["cancelled", "confirmed", "delivered", "packed", "pending", "returned", "shipped"],
    );
  });
});
