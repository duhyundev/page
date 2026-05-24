import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./auth";

describe("session tokens", () => {
  it("round-trips a freshly signed token", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rejects missing / garbage tokens", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken(null)).toBe(false);
    expect(await verifySessionToken("not-a-jwt")).toBe(false);
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken();
    const tampered = `${token.slice(0, -2)}xx`;
    expect(await verifySessionToken(tampered)).toBe(false);
  });
});
