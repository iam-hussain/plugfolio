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

export type AdminProfileRow = {
  readonly id: string;
  readonly username: string;
  readonly ownerEmail: string;
  readonly suspendedAt: Date | null;
  /** The owning account's suspension — darkens the page too (ADR-0014). */
  readonly ownerSuspendedAt: Date | null;
  readonly managerCount: number;
  readonly postCount: number;
  readonly productCount: number;
  readonly followerCount: number;
  readonly createdAt: Date;
};

export type AdminProfileRepository = {
  /** Newest first; query matches username or owner email substring. */
  search(query: string | undefined, limit: number): Promise<readonly AdminProfileRow[]>;
  setSuspended(profileId: string, at: Date | null): Promise<"ok" | "not_found">;
  /** Returns the released (previous) username for the audit trail. */
  setUsername(
    profileId: string,
    username: string,
  ): Promise<{ previous: string } | "not_found" | "taken">;
};

export type AdminCommentRow = {
  readonly id: string;
  readonly body: string;
  readonly authorHandle: string;
  /** Set when the comment speaks as a profile (ADR-0009). */
  readonly asProfileUsername: string | null;
  readonly pageUsername: string;
  readonly productTitle: string | null;
  readonly replyCount: number;
  readonly createdAt: Date;
};

export type AdminPostRow = {
  readonly id: string;
  readonly mediaUrl: string;
  readonly caption: string | null;
  readonly username: string;
  readonly productCount: number;
  readonly createdAt: Date;
};

export type AdminProductRow = {
  readonly id: string;
  readonly title: string;
  readonly username: string;
  readonly kind: "affiliate" | "own";
  readonly affiliateUrl: string | null;
  readonly couponCode: string | null;
  readonly offerEndsAt: Date | null;
  readonly priceCents: number | null;
  readonly currency: string;
  readonly createdAt: Date;
};

/** The takedown surface: everything creators publish, searchable and removable. */
export type AdminContentRepository = {
  searchComments(query: string | undefined, limit: number): Promise<readonly AdminCommentRow[]>;
  /** Replies go with their parent (schema cascade). Returns the removed body
   * so the audit detail records what was actually deleted. */
  deleteComment(commentId: string): Promise<{ body: string } | "not_found">;
  searchPosts(query: string | undefined, limit: number): Promise<readonly AdminPostRow[]>;
  deletePost(postId: string): Promise<"ok" | "not_found">;
  searchProducts(query: string | undefined, limit: number): Promise<readonly AdminProductRow[]>;
  deleteProduct(productId: string): Promise<{ title: string } | "not_found">;
  clearCoupon(productId: string): Promise<"ok" | "not_found">;
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
