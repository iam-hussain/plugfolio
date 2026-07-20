/**
 * Ports for profile Managers (ADR-0004). The invitee is identified by email:
 * a User row is found or created for it, and their existing magic-link
 * sign-in picks the membership up — no separate acceptance flow in v1.
 */

export type ManagerView = {
  readonly userId: string;
  readonly email: string;
  readonly name: string | null;
};

export type ManagerRepository = {
  list(profileId: string): Promise<readonly ManagerView[]>;
  count(profileId: string): Promise<number>;
  /** Idempotent — inviting the same user twice is a no-op. */
  add(profileId: string, userId: string): Promise<void>;
  remove(profileId: string, userId: string): Promise<void>;
};

export type UserRepository = {
  findOrCreateByEmail(email: string): Promise<{ id: string }>;
};
