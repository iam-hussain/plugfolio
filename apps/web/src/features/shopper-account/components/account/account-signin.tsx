import { AccountSection, Button, SettingRow, SettingRows } from "@plugfolio/ui";
import Link from "next/link";

/**
 * "Signing in" — email + password, verified once at registration (ADR-0012).
 *
 * Both escape hatches here route to support rather than a self-serve button, on
 * purpose: changing the login email needs the new address verified *first*, and
 * someone locked out of their inbox can't prove anything from inside the app. A
 * person confirms both (docs/implementation/support.md).
 */
export function AccountSignIn({ email }: { email: string }) {
  return (
    <AccountSection
      id="signin"
      title="Signing in"
      lead="Your email is your login — there is no username to remember, and no magic link to wait for. One email, one password, one step."
    >
      <SettingRows>
        <SettingRow
          label="Email"
          value={email}
          hint="This is your login ID. Changing it needs the new address verified first, so support makes the swap."
          action={
            <Button variant="secondary" asChild>
              <Link href={{ pathname: "/support", query: { category: "change_email" } }}>
                Change email
              </Link>
            </Button>
          }
        />
        <SettingRow
          label="Password"
          value="Set by you"
          hint="At least 8 characters. We email a link so the change is confirmed from your inbox."
          action={
            <Button variant="secondary" asChild>
              <Link href="/forgot">Change password</Link>
            </Button>
          }
        />
        <SettingRow
          label="Locked out?"
          value={`If you can't reach ${email} any more, support can move you across.`}
          hint="You don't need to be signed in to ask."
          action={
            <Button variant="secondary" asChild>
              <Link href={{ pathname: "/support", query: { category: "lost_email_access" } }}>
                Get help
              </Link>
            </Button>
          }
        />
      </SettingRows>
    </AccountSection>
  );
}
