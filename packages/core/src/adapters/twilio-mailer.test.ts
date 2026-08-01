import { describe, expect, it } from "vitest";
import { parseFrom } from "./twilio-mailer";

describe("parseFrom", () => {
  it("splits a named sender", () => {
    expect(parseFrom("Plugfolio <no-reply@plugfolio.com>")).toEqual({
      address: "no-reply@plugfolio.com",
      name: "Plugfolio",
    });
  });

  it("keeps a bare address whole", () => {
    expect(parseFrom(" no-reply@plugfolio.com ")).toEqual({ address: "no-reply@plugfolio.com" });
  });

  it("drops an empty display name rather than sending one", () => {
    expect(parseFrom("<no-reply@plugfolio.com>")).toEqual({ address: "no-reply@plugfolio.com" });
  });
});
