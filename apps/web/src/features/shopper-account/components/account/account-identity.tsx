import { SettingRow, SettingRows } from "@plugfolio/ui";
import { HandleForm } from "../handle-form";

/**
 * "You" — how the account appears when it acts as itself: following a creator,
 * or leaving a comment. The identity itself is stated once, by the hero above
 * the index; this panel is only the parts you can change.
 *
 * The rule this section exists to state plainly: a comment is signed with the
 * member handle (ADR-0009), never the name and never the email. The email is in
 * *Signing in*, because it's a login credential, not an identity.
 */
export type AccountIdentityProps = {
  name: string | null;
  image: string | null;
  handle: string;
};

export function AccountIdentity({ name, image, handle }: AccountIdentityProps) {
  return (
    <SettingRows>
      <SettingRow
        label="Name"
        value={name ?? "Not set"}
        hint="Comes from the social you connected. Comments are signed with your handle, never your name or email."
      />
      <SettingRow
        label="Member handle"
        value={`@${handle}`}
        hint="The name on your comments. Not a creator page, and never your email — that stays private."
      >
        <HandleForm currentHandle={handle} />
      </SettingRow>
      {/* ponytail: photo is whatever the connected social gave us —
              an uploader lands with media storage, not before. */}
      <SettingRow
        label="Profile photo"
        value={image ? "Set" : "Not set"}
        hint="Shown beside your comments and in the account menu. It follows your connected account."
      />
    </SettingRows>
  );
}
