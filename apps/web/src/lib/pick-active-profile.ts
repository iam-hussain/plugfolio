import type { ProfileSummary } from "@plugfolio/core";

/** The dashboard's ?profile= switcher: requested profile if owned, else first. */
export function pickActiveProfile(
  profiles: readonly ProfileSummary[],
  requested: string | undefined,
): ProfileSummary | undefined {
  return profiles.find((profile) => profile.id === requested) ?? profiles[0];
}
