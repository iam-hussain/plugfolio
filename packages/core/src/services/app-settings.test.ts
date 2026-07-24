import { describe, expect, it } from "vitest";
import type {
  AdminAuditEntry,
  AdminAuditRepository,
  AppSettingsRepository,
} from "../ports/admin-repository";
import {
  getFeatureFlags,
  getReservedUsernames,
  isFeatureEnabled,
  isUsernameReserved,
  removeFeatureFlag,
  setFeatureFlag,
  setReservedUsernames,
} from "./app-settings";

function makeDeps() {
  const store = new Map<string, unknown>();
  const recorded: AdminAuditEntry[] = [];
  const settings: AppSettingsRepository = {
    async get(key) {
      return store.get(key) ?? null;
    },
    async set(key, value) {
      store.set(key, value);
    },
  };
  const audit: AdminAuditRepository = {
    async record(entry) {
      recorded.push(entry);
    },
    async listRecent() {
      return [];
    },
    async search() {
      return { rows: [], total: 0 };
    },
    async admins() {
      return [];
    },
  };
  return { deps: { settings, audit }, store, recorded };
}

describe("reserved usernames", () => {
  it("baseline route names are always reserved, case-insensitively", async () => {
    const { deps } = makeDeps();
    expect(await isUsernameReserved(deps, "dashboard")).toBe(true);
    expect(await isUsernameReserved(deps, "  Homepage ")).toBe(true);
    expect(await isUsernameReserved(deps, "some-creator")).toBe(false);
  });

  it("admin additions extend the baseline and are normalized + audited", async () => {
    const { deps, recorded } = makeDeps();
    const saved = await setReservedUsernames(deps, "admin-1", [" Winner ", "winner", "", "vip"]);
    expect(saved).toEqual(["winner", "vip"]);
    expect(await isUsernameReserved(deps, "WINNER")).toBe(true);
    expect(await getReservedUsernames(deps)).toEqual(["winner", "vip"]);
    expect(recorded[0]?.action).toBe("settings.reservedUsernames");
  });

  it("a corrupt stored value degrades to the baseline, not a crash", async () => {
    const { deps, store } = makeDeps();
    store.set("reservedUsernames", { nope: true });
    expect(await isUsernameReserved(deps, "dashboard")).toBe(true);
    expect(await isUsernameReserved(deps, "some-creator")).toBe(false);
  });
});

describe("feature flags", () => {
  it("set, read with fallback, and remove — all audited", async () => {
    const { deps, recorded } = makeDeps();
    expect(await isFeatureEnabled(deps, "comments", true)).toBe(true);

    await setFeatureFlag(deps, "admin-1", "Comments", false);
    expect(await isFeatureEnabled(deps, "comments", true)).toBe(false);
    expect(await getFeatureFlags(deps)).toEqual({ comments: false });

    await removeFeatureFlag(deps, "admin-1", "comments");
    expect(await isFeatureEnabled(deps, "comments", true)).toBe(true);
    expect(recorded.map((r) => r.action)).toEqual([
      "settings.featureFlag",
      "settings.featureFlag",
    ]);
  });

  it("rejects flag names that are not kebab-case", async () => {
    const { deps } = makeDeps();
    await expect(setFeatureFlag(deps, "admin-1", "no spaces!", true)).rejects.toThrow();
  });
});
