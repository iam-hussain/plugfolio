/**
 * Shared "not hidden" / "not suspended" read predicates.
 *
 * Mongo stores an unset optional field as ABSENT, and Prisma's `{ isSet: false }`
 * matches ONLY absent — never a stored null. But our write paths DO store null:
 *   • unhiding a post writes `hiddenAt: null`               (creator-content-repository)
 *   • restoring a member/profile writes `suspendedAt: null` (admin-members / admin-profiles)
 *
 * So a bare `{ isSet: false }` silently drops every row that was toggled and
 * then restored — a re-shown post, a reinstated creator. Any "not hidden" or
 * "not suspended" READ must match BOTH shapes, which these fragments do. Keep
 * new visibility reads pointed here instead of re-inlining `{ isSet: false }`.
 */
export const notHidden = { OR: [{ hiddenAt: { isSet: false } }, { hiddenAt: null }] };

export const notSuspended = { OR: [{ suspendedAt: { isSet: false } }, { suspendedAt: null }] };

/** A live profile: neither it nor its owning user is suspended. */
export const liveProfile = { AND: [notSuspended, { user: notSuspended }] };
