import type { AdminAuditEntry, AdminAuditRepository } from "../ports/admin-repository";

/** In-memory audit fake shared by the admin service tests. */
export function fakeAudit() {
  const recorded: AdminAuditEntry[] = [];
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
  return { audit, recorded };
}

/** Settings fake with no stored keys — baseline-only reserved list. */
export function fakeSettings() {
  const store = new Map<string, unknown>();
  return {
    settings: {
      async get(key: string) {
        return store.get(key) ?? null;
      },
      async set(key: string, value: unknown) {
        store.set(key, value);
      },
    },
    store,
  };
}
