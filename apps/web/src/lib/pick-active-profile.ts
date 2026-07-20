import type { AccessibleProfile } from "@plugfolio/core";

/** The dashboard's ?profile= switcher: requested profile if accessible, else first. */
export function pickActiveProfile(
  profiles: readonly AccessibleProfile[],
  requested: string | undefined,
): AccessibleProfile | undefined {
  return profiles.find((profile) => profile.id === requested) ?? profiles[0];
}
