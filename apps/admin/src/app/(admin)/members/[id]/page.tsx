import { getMemberDetail, generateMemberHandle, NotFoundError } from "@plugfolio/core";
import {
  ActionForm,
  Badge,
  Button,
  ConfirmDialog,
  PromptDialog,
} from "@plugfolio/ui";
import { AlertTriangle, ArrowLeft, Link2, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/panel";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";
import {
  deleteMemberAccountAction,
  resendMemberVerificationAction,
  resetMemberHandleAction,
  sendMemberPasswordResetAction,
  suspendMemberAction,
  unsuspendMemberAction,
} from "../actions";

export const metadata: Metadata = { title: "Member" };
export const dynamic = "force-dynamic";

// Brand glyphs aren't in lucide (§8) — the label names the platform.
const PROVIDER_LABEL: Record<string, string> = {
  google: "YouTube (Google)",
  facebook: "Instagram (Meta)",
};

function sectionTitle(text: string) {
  return <h2 className="font-display mb-1.5 text-[15px] font-bold">{text}</h2>;
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let member;
  try {
    member = await getMemberDetail({ members: repositories.members }, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const suggestedHandle = generateMemberHandle();

  return (
    <div className="max-w-[940px]">
      <Link
        href="/members"
        className="font-mono text-muted-foreground mb-3.5 inline-flex items-center gap-[7px] text-xs"
      >
        <ArrowLeft aria-hidden className="size-4" /> Members / {member.email}
      </Link>

      {member.suspendedAt ? (
        <div className="bg-destructive/10 border-destructive/30 mb-4 flex items-start gap-[11px] rounded-[10px] border px-3.5 py-3">
          <AlertTriangle aria-hidden className="text-destructive mt-px size-[18px] shrink-0" />
          <p className="text-[13px] font-semibold">
            This member is suspended — blocked from signing in, all owned profiles hidden.
          </p>
        </div>
      ) : null}

      <Panel className="flex flex-wrap items-start justify-between gap-5 px-6 py-[22px]">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">{member.email}</h1>
          <p className="text-muted-foreground mt-1 text-[13.5px]">
            {member.name ?? "—"} · <span className="font-mono">@{member.username}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.suspendedAt ? (
              <Badge shape="square" variant="soft-destructive">Suspended</Badge>
            ) : member.emailVerified ? (
              <Badge shape="square" variant="outline-muted">Active</Badge>
            ) : (
              <Badge shape="square" variant="outline-muted">Unverified</Badge>
            )}
            {member.profileCount > 0 ? (
              <Badge shape="square" variant="soft-primary">Creator · {member.profileCount}</Badge>
            ) : null}
            {member.hasBusiness ? (
              <Badge shape="square" variant="soft-primary">Business</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {!member.emailVerified ? (
            <ActionForm
              action={resendMemberVerificationAction}
              hiddenFields={{ email: member.email }}
              successToast={`Verification email resent to ${member.email}`}
            >
              <Button type="submit" size="xs" variant="outline-strong">
                Resend verification
              </Button>
            </ActionForm>
          ) : null}
          <ActionForm
            action={sendMemberPasswordResetAction}
            hiddenFields={{ email: member.email }}
            successToast={`Password reset link sent to ${member.email}`}
          >
            <Button type="submit" size="xs" variant="outline-strong">
              Send password reset
            </Button>
          </ActionForm>
          <PromptDialog
            trigger={<Button size="xs" variant="outline-strong">Reset @handle</Button>}
            title="Reset handle"
            description={`Frees @${member.username} for reassignment — covers names grabbed before they were reserved. The account keeps everything; only the @handle changes. Recorded in the audit log.`}
            current={`@${member.username}`}
            becomes={`@${suggestedHandle}`}
            label="New handle for this member"
            name="username"
            defaultValue={suggestedHandle}
            pattern="[a-z0-9][a-z0-9._-]{2,29}"
            patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
            hiddenFields={{ userId: member.id }}
            confirmLabel="Reset handle"
            action={resetMemberHandleAction}
            successToast="Handle reset"
          />
          {member.suspendedAt ? (
            <ConfirmDialog
              trigger={<Button size="xs" variant="outline-strong">Unsuspend</Button>}
              title="Unsuspend this member?"
              body="They regain access and their profiles return to shoppers. Recorded in the audit log."
              confirmLabel="Unsuspend"
              tone="primary"
              action={unsuspendMemberAction}
              hiddenFields={{ userId: member.id }}
              successToast="Unsuspended"
            />
          ) : (
            <ConfirmDialog
              trigger={<Button size="xs" variant="destructive-outline">Suspend</Button>}
              title="Suspend member"
              body="They will be blocked from signing in and every profile they own is hidden from shoppers. Reversible — nothing is deleted. Recorded in the audit log."
              confirmLabel="Suspend"
              action={suspendMemberAction}
              hiddenFields={{ userId: member.id }}
              requireReason={{}}
              successToast="Suspended"
            />
          )}
          <ConfirmDialog
            trigger={
              <Button size="icon-2xs" variant="ghost-muted" aria-label="Delete account" title="Delete account">
                <Trash2 aria-hidden className="size-[15px]" />
              </Button>
            }
            title="Delete account"
            body="Permanently deletes this member and their profiles, posts, products, comments and follows. This cannot be undone."
            confirmLabel="Delete forever"
            action={deleteMemberAccountAction}
            hiddenFields={{ userId: member.id }}
            requireMatch={{
              value: `@${member.username}`,
              note: "Deleted: profiles, posts, products, comments, follows. Surviving: recorded taps (as anonymous events).",
            }}
            successToast="Account deleted"
          />
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel className="px-5 py-[18px]">
          {sectionTitle("Profiles")}
          {member.profiles.map((profile) => (
            <div
              key={profile.id}
              className="border-border flex items-center justify-between border-t py-[9px]"
            >
              <Link href={`/profiles/${profile.id}`} className="font-mono text-[13px] font-bold">
                /{profile.username}
              </Link>
              <Badge shape="square" variant="soft-primary">{profile.role}</Badge>
            </div>
          ))}
          {member.profiles.length === 0 ? (
            <p className="text-faint border-border border-t py-5 text-center text-[13px]">
              No profiles.
            </p>
          ) : null}
        </Panel>

        <Panel className="px-5 py-[18px]">
          {sectionTitle("Connected socials")}
          {member.socials.map((social) => (
            <div
              key={social.provider}
              className="border-border flex items-center gap-2.5 border-t py-[9px]"
            >
              <Link2 aria-hidden className="text-muted-foreground size-4 shrink-0" />
              <span className="flex-1 text-[13px] font-medium">
                {PROVIDER_LABEL[social.provider] ?? social.provider}
              </span>
              <span className="text-faint text-[11px]">connected</span>
            </div>
          ))}
          {member.socials.length === 0 ? (
            <p className="text-faint border-border border-t py-5 text-center text-[13px]">
              Nothing connected.
            </p>
          ) : null}
        </Panel>

        <Panel className="px-5 py-[18px]">
          <div className="mb-1.5 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Recent comments</h2>
            <Link
              href={`/comments?q=${encodeURIComponent(member.username)}`}
              className="font-mono text-primary text-[11px]"
            >
              All →
            </Link>
          </div>
          {member.recentComments.map((comment, index) => (
            <div key={index} className="border-border border-t py-[9px]">
              <p className="text-[13px]">{comment.body}</p>
              <p className="font-mono text-muted-foreground mt-0.5 text-xs tabular-nums">
                {comment.createdAt.toISOString().slice(0, 10)}
              </p>
            </div>
          ))}
          {member.recentComments.length === 0 ? (
            <p className="text-faint border-border border-t py-5 text-center text-[13px]">
              No comments.
            </p>
          ) : null}
        </Panel>

        <Panel className="px-5 py-[18px]">
          {sectionTitle("Meta")}
          <div className="border-border flex justify-between border-t py-[9px] text-[13px]">
            <span className="text-muted-foreground">Joined</span>
            <span className="tabular-nums">{member.createdAt.toISOString().slice(0, 10)}</span>
          </div>
          <div className="border-border flex justify-between border-t py-[9px] text-[13px]">
            <span className="text-muted-foreground">Member id</span>
            <span className="font-mono text-xs">{member.id}</span>
          </div>
          <div className="border-border flex justify-between border-t py-[9px] text-[13px]">
            <span className="text-muted-foreground">Following</span>
            <span className="tabular-nums">{member.followingCount}</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
