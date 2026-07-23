/**
 * Ports for the admin app (docs/implementation/admin-app.md). Admin identity
 * is deliberately separate from the product User table — a product-auth bug
 * must never escalate to admin access.
 */

export type AdminAccount = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly passwordHash: string;
};

export type AdminUserRepository = {
  findByEmail(email: string): Promise<AdminAccount | null>;
};

export type AdminAuditEntry = {
  adminId: string;
  /** Verb, dot-namespaced: "member.suspend", "settings.reservedUsernames". */
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
};

export type AdminAuditView = {
  readonly id: string;
  readonly adminEmail: string;
  readonly action: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly detail: string | null;
  readonly createdAt: Date;
};

export type AdminAuditRepository = {
  /** Append-only — no update/delete, same discipline as Tap. */
  record(entry: AdminAuditEntry): Promise<void>;
  listRecent(limit: number): Promise<readonly AdminAuditView[]>;
};

export type AppSettingsRepository = {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
};

export type AdminMemberRow = {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly name: string | null;
  readonly emailVerified: Date | null;
  readonly suspendedAt: Date | null;
  readonly createdAt: Date;
  readonly profileCount: number;
  readonly hasBusiness: boolean;
};

export type AdminMemberRepository = {
  /** Newest first; query matches email/@handle/name substring. */
  search(query: string | undefined, limit: number): Promise<readonly AdminMemberRow[]>;
  setSuspended(userId: string, at: Date | null): Promise<"ok" | "not_found">;
};

/** The dashboard tiles — counts, plus 7-day activity. */
export type AdminOverview = {
  readonly members: number;
  readonly profiles: number;
  readonly businesses: number;
  readonly posts: number;
  readonly products: number;
  readonly taps7d: number;
  readonly codeCopies7d: number;
  readonly comments7d: number;
};

export type AdminOverviewRepository = {
  overview(since: Date): Promise<AdminOverview>;
};
