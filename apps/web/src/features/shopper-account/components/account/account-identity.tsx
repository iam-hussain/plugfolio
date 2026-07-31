import {
  AccountSection,
  Avatar,
  AvatarFallback,
  AvatarImage,
  SettingRow,
  SettingRows,
} from "@plugfolio/ui";
import { HandleForm } from "../handle-form";

/**
 * "You" — how the account appears when it acts as itself: following a creator,
 * or leaving a comment.
 *
 * The rule this section exists to state plainly: a comment is signed with the
 * member handle (ADR-0009), never the name and never the email. The email is on
 * the *next* section, because it's a login credential, not an identity.
 */
export type AccountIdentityProps = {
  email: string;
  name: string | null;
  image: string | null;
  handle: string;
};

export function AccountIdentity({ email, name, image, handle }: AccountIdentityProps) {
  return (
    <section id="identity" className="mt-5 scroll-mt-24">
      <div className="border-border bg-card rounded-card flex flex-wrap items-center gap-4 border px-5 py-5">
        <Avatar className="size-[72px]">
          {image ? <AvatarImage src={image} alt="" /> : null}
          <AvatarFallback className="bg-active text-primary font-display text-name font-bold">
            {(handle || email || "?").trim().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <b className="font-display block text-title font-bold tracking-[-0.02em]">
            {name ?? `@${handle}`}
          </b>
          <span className="text-muted-foreground mt-0.5 block truncate text-copy">
            @{handle} · {email}
          </span>
        </div>
      </div>

      <AccountSection
        title="You"
        lead="How you appear when you act as yourself — following a creator, or leaving a comment."
      >
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
      </AccountSection>
    </section>
  );
}
