/**
 * Ports for the admin app (docs/implementation/admin-app.md, design:
 * docs/design/admin-console*.md). Admin identity is deliberately separate
 * from the product User table — a product-auth bug must never escalate to
 * admin access.
 */

/** One page of a list query — every admin list is server-paginated. */
export type Page<T> = { readonly rows: readonly T[]; readonly total: number };

export type PageQuery = { readonly page: number; readonly pageSize: number };

// --- Operators -------------------------------------------------------------

export type AdminAccount = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  /** Null = invited, password not set yet — cannot sign in. */
  readonly passwordHash: string | null;
};

export type AdminOperatorRow = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly createdAt: Date;
  readonly lastSignInAt: Date | null;
};

export type AdminUserRepository = {
  findByEmail(email: string): Promise<AdminAccount | null>;
  list(): Promise<readonly AdminOperatorRow[]>;
  /** Passwordless row — the emailed link sets the first password. */
  create(operator: { email: string; name: string | null }): Promise<{ id: string } | "exists">;
  remove(adminId: string): Promise<"ok" | "not_found">;
  count(): Promise<number>;
  setPassword(adminId: string, passwordHash: string): Promise<void>;
  recordSignIn(adminId: string, at: Date): Promise<void>;
};

// --- Audit -----------------------------------------------------------------

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

export type AdminAuditFilter = {
  readonly adminEmail?: string;
  /** Prefix match on the verb ("member." matches member.suspend …). */
  readonly actionPrefix?: string;
  readonly since?: Date;
};

export type AdminAuditRepository = {
  /** Append-only — no update/delete, same discipline as Tap. */
  record(entry: AdminAuditEntry): Promise<void>;
  listRecent(limit: number): Promise<readonly AdminAuditView[]>;
  search(filter: AdminAuditFilter, page: PageQuery): Promise<Page<AdminAuditView>>;
  /** Distinct operator emails that appear in the log (filter dropdown). */
  admins(): Promise<readonly string[]>;
};

// --- App settings ----------------------------------------------------------

export type AppSettingsRepository = {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
};

// --- Members ---------------------------------------------------------------

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

export type MemberStatusFilter = "active" | "unverified" | "suspended";

export type AdminMemberDetail = AdminMemberRow & {
  readonly profiles: readonly { id: string; username: string; role: "Owner" | "Manager" }[];
  readonly socials: readonly { provider: string; connectedAt: Date | null }[];
  readonly recentComments: readonly { body: string; createdAt: Date }[];
  readonly followingCount: number;
};

export type AdminMemberRepository = {
  /** Newest first; query matches email/@handle/name substring. */
  search(
    query: string | undefined,
    status: MemberStatusFilter | undefined,
    page: PageQuery,
  ): Promise<Page<AdminMemberRow>>;
  setSuspended(userId: string, at: Date | null): Promise<"ok" | "not_found">;
  setSuspendedBulk(userIds: readonly string[], at: Date): Promise<number>;
  detail(userId: string): Promise<AdminMemberDetail | null>;
  /** Full cascade delete; returns the email for the audit trail. */
  remove(userId: string): Promise<{ email: string } | "not_found">;
};

// --- Profiles --------------------------------------------------------------

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

export type ProfileStatusFilter = "live" | "suspended" | "owner-suspended";

export type AdminProfileDetail = AdminProfileRow & {
  readonly managers: readonly { email: string; since: Date }[];
  readonly categories: readonly string[];
  readonly taps30d: number;
  readonly codeCopies30d: number;
  readonly posts: readonly { id: string; mediaUrl: string; caption: string | null }[];
  readonly products: readonly {
    id: string;
    title: string;
    kind: "affiliate" | "own";
    couponCode: string | null;
    taps30d: number;
  }[];
};

export type AdminProfileRepository = {
  search(
    query: string | undefined,
    status: ProfileStatusFilter | undefined,
    page: PageQuery,
  ): Promise<Page<AdminProfileRow>>;
  setSuspended(profileId: string, at: Date | null): Promise<"ok" | "not_found">;
  /** Returns the released (previous) username for the audit trail. */
  setUsername(
    profileId: string,
    username: string,
  ): Promise<{ previous: string } | "not_found" | "taken">;
  detail(profileId: string, since30: Date): Promise<AdminProfileDetail | null>;
};

// --- Content (posts / products / comments) ---------------------------------

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

export type ProductCouponFilter = "has-coupon" | "expired-coupon";

/** The takedown surface: everything creators publish, searchable and removable. */
export type AdminContentRepository = {
  /** Comments paginate by "load more": first `limit` rows + total. */
  searchComments(query: string | undefined, limit: number): Promise<Page<AdminCommentRow>>;
  /** Replies go with their parent (schema cascade). Returns the removed body
   * so the audit detail records what was actually deleted. */
  deleteComment(commentId: string): Promise<{ body: string } | "not_found">;
  deleteCommentsBulk(commentIds: readonly string[]): Promise<number>;
  searchPosts(query: string | undefined, page: PageQuery): Promise<Page<AdminPostRow>>;
  deletePost(postId: string): Promise<"ok" | "not_found">;
  deletePostsBulk(postIds: readonly string[]): Promise<number>;
  searchProducts(
    query: string | undefined,
    coupon: ProductCouponFilter | undefined,
    now: Date,
    page: PageQuery,
  ): Promise<Page<AdminProductRow>>;
  deleteProduct(productId: string): Promise<{ title: string } | "not_found">;
  deleteProductsBulk(productIds: readonly string[]): Promise<number>;
  clearCoupon(productId: string): Promise<"ok" | "not_found">;
};

// --- Marketplace -----------------------------------------------------------

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
  search(query: string | undefined, page: PageQuery): Promise<Page<AdminBusinessRow>>;
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
  search(query: string | undefined, page: PageQuery): Promise<Page<AdminRequirementRow>>;
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

export type AdminCollabMessage = {
  readonly id: string;
  readonly senderName: string;
  readonly role: "business" | "creator";
  readonly body: string;
  readonly createdAt: Date;
};

export type AdminCollabThread = AdminCollabRow & {
  readonly messages: readonly AdminCollabMessage[];
};

export type AdminCollabRepository = {
  list(query: string | undefined, page: PageQuery): Promise<Page<AdminCollabRow>>;
  thread(collabId: string): Promise<AdminCollabThread | null>;
  /** Returns the removed body for the audit trail. */
  deleteMessage(messageId: string): Promise<{ body: string } | "not_found">;
};

// --- Reports ---------------------------------------------------------------

export type ReportTargetType = "comment" | "product" | "profile" | "post";
export type ReportCategory = "spam" | "scam" | "offensive" | "impersonation" | "other";
export type ReportStatus = "open" | "resolved" | "dismissed";

export type AdminReportRow = {
  readonly id: string;
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  readonly category: ReportCategory;
  readonly note: string | null;
  readonly reporterLabel: string;
  readonly snippet: string;
  readonly status: ReportStatus;
  readonly createdAt: Date;
};

export type AdminReportRepository = {
  /** Open queue is oldest-first (triage order); others newest-first. */
  list(status: ReportStatus | "all", page: PageQuery): Promise<Page<AdminReportRow>>;
  setStatus(
    reportId: string,
    status: ReportStatus,
    at: Date,
  ): Promise<{ snippet: string } | "not_found">;
  openCount(): Promise<number>;
};

// --- Overview & analytics --------------------------------------------------

/** The dashboard tiles — totals plus this-week deltas. */
export type AdminOverview = {
  readonly members: number;
  readonly membersNew7d: number;
  readonly profiles: number;
  readonly profilesNew7d: number;
  readonly businesses: number;
  readonly businessesNew7d: number;
  readonly posts: number;
  readonly postsNew7d: number;
  readonly products: number;
  readonly productsNew7d: number;
  readonly taps7d: number;
  readonly tapsPrior7d: number;
  readonly codeCopies7d: number;
  readonly codeCopiesPrior7d: number;
  readonly comments7d: number;
  readonly openReports: number;
};

export type AdminOverviewRepository = {
  overview(since7: Date, since14: Date): Promise<AdminOverview>;
};

export type AdminAnalytics = {
  readonly taps7d: number;
  readonly taps30d: number;
  readonly codeCopies7d: number;
  readonly codeCopies30d: number;
  /** 30-day tap split by surface (profile / post / product). */
  readonly sourceSplit: readonly { source: string; taps: number }[];
  /** Taps per UTC day over the last 30 days, oldest first, gaps filled. */
  readonly tapsPerDay: readonly { day: string; taps: number }[];
  /** 30-day leaders. */
  readonly topProfiles: readonly { username: string; taps: number }[];
  readonly topProducts: readonly { title: string; username: string; taps: number }[];
};

/** Projections over the append-only Tap/CodeCopy events — nothing new tracked. */
export type AdminAnalyticsRepository = {
  analytics(since7: Date, since30: Date, topLimit: number): Promise<AdminAnalytics>;
};
