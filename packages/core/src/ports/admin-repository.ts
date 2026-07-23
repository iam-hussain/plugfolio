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

export type AdminBusinessRow = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly logoUrl: string | null;
  readonly ownerEmail: string;
  readonly ownerSuspendedAt: Date | null;
  readonly requirementCount: number;
  readonly collabCount: number;
  readonly createdAt: Date;
};

export type AdminBusinessRepository = {
  /** Newest first; query matches name, description, or owner email. */
  search(query: string | undefined, limit: number): Promise<readonly AdminBusinessRow[]>;
  clearLogo(businessId: string): Promise<"ok" | "not_found">;
};

export type AdminRequirementRow = {
  readonly id: string;
  readonly title: string;
  readonly brief: string;
  readonly budget: string | null;
  readonly deadline: Date | null;
  readonly businessName: string;
  readonly collabCount: number;
  readonly createdAt: Date;
};

export type AdminRequirementRepository = {
  /** Newest first; query matches title, brief, or business name. */
  search(query: string | undefined, limit: number): Promise<readonly AdminRequirementRow[]>;
  /** Threads survive removal (schema SetNull); returns the title for the audit. */
  delete(requirementId: string): Promise<{ title: string } | "not_found">;
};

export type AdminCollabRow = {
  readonly id: string;
  readonly businessName: string;
  readonly profileUsername: string;
  /** Null = a direct reach-out (door two), not board-sourced. */
  readonly requirementTitle: string | null;
  readonly messageCount: number;
  readonly businessAgreedAt: Date | null;
  readonly creatorAgreedAt: Date | null;
  readonly createdAt: Date;
};

/** Read-only oversight — moderation happens via member suspension. */
export type AdminCollabRepository = {
  list(query: string | undefined, limit: number): Promise<readonly AdminCollabRow[]>;
};

export type AdminAnalytics = {
  readonly taps7d: number;
  readonly taps30d: number;
  readonly codeCopies7d: number;
  readonly codeCopies30d: number;
  /** 30-day tap split by surface (profile / post / product). */
  readonly sourceSplit: readonly { source: string; taps: number }[];
  /** 30-day leaders. */
  readonly topProfiles: readonly { username: string; taps: number }[];
  readonly topProducts: readonly { title: string; username: string; taps: number }[];
};

/** Projections over the append-only Tap/CodeCopy events — nothing new tracked. */
export type AdminAnalyticsRepository = {
  analytics(since7: Date, since30: Date, topLimit: number): Promise<AdminAnalytics>;
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
