import { Button, SettingRow, SettingRows } from "@plugfolio/ui";
import Link from "next/link";

/**
 * "Signing in" — email **or** member handle, one password behind both, the
 * email verified once at registration (ADR-0012, ADR-0024).
 *
 * Both escape hatches here route to support rather than a self-serve button, on
 * purpose: changing the login email needs the new address verified *first*, and
 * someone locked out of their inbox can't prove anything from inside the app. A
 * person confirms both (docs/implementation/support.md).
 */
export function AccountSignIn({ email, handle }: { email: string; handle: string }) {
  return (
    <SettingRows>
      <SettingRow
        label="Email"
        value={email}
        hint="A login ID, and the one we reach you on. Changing it needs the new address verified first, so support makes the swap."
        action={
          <Button variant="secondary" asChild>
            <Link href={{ pathname: "/support", query: { category: "change_email" } }}>
              Change email
            </Link>
          </Button>
        }
      />
      <SettingRow
        label="Username"
        value={`@${handle}`}
        hint="Works at sign-in exactly like your email, with the same password. Change it in You."
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
  );
}
