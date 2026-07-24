import {
  generateProfileUsername,
  getProfileDetail,
  NotFoundError,
} from "@plugfolio/core";
import {
  Badge,
  Button,
  ConfirmDialog,
  PromptDialog,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/panel";
import { ProfileStatusBadge } from "@/components/status-badges";
import { env } from "@/env";
import { requireAdmin } from "@/server/auth";
import { clock, repositories } from "@/server/container";
import { deleteProductAction } from "../../products/actions";
import { deletePostAction } from "../../posts/actions";
import { releaseUsernameAction, suspendProfileAction, unsuspendProfileAction } from "../actions";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) notFound();
  let profile;
  try {
    profile = await getProfileDetail(
      { profiles: repositories.profiles, now: clock.now },
      id,
    );
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const suggested = generateProfileUsername();
  const live = !profile.suspendedAt && !profile.ownerSuspendedAt;

  return (
    <div className="max-w-[940px]">
      <Link
        href="/profiles"
        className="font-mono text-muted-foreground mb-3.5 inline-flex items-center gap-[7px] text-xs"
      >
        <ArrowLeft aria-hidden className="size-4" /> Profiles / {profile.username}
      </Link>

      {!live ? (
        <div className="bg-destructive/10 border-destructive/30 mb-4 flex items-start gap-[11px] rounded-[10px] border px-3.5 py-3">
          <AlertTriangle aria-hidden className="text-destructive mt-px size-[18px] shrink-0" />
          <p className="text-[13px] font-semibold">This page is not live to shoppers.</p>
        </div>
      ) : null}

      <Panel className="flex flex-wrap items-start justify-between gap-5 px-6 py-[22px]">
        <div>
          <h1 className="font-mono text-[22px] font-bold tracking-[-0.01em]">
            /{profile.username}
          </h1>
          <p className="text-muted-foreground mt-[5px] text-[13.5px]">
            {profile.ownerEmail}
            {profile.managerCount > 0 ? (
              <span className="text-faint"> · +{profile.managerCount} managers</span>
            ) : null}
          </p>
          <div className="mt-3">
            <ProfileStatusBadge
              suspendedAt={profile.suspendedAt}
              ownerSuspendedAt={profile.ownerSuspendedAt}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {live ? (
            <Button asChild size="xs" variant="outline-strong">
              <a href={`${env.WEB_ORIGIN}/${profile.username}`} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden className="size-3.5" /> View public page
              </a>
            </Button>
          ) : null}
          <PromptDialog
            trigger={<Button size="xs" variant="outline-strong">Release username</Button>}
            title="Release username"
            description={`Frees /${profile.username} for its rightful owner — the lever for impersonation, squatting, and handle disputes. The page stays live at the new address; nothing is deleted; the freed name is claimable immediately. Recorded in the audit log.`}
            current={`/${profile.username}`}
            becomes={`/${suggested}`}
            label="New username for this page"
            name="username"
            defaultValue={suggested}
            pattern="[a-z0-9][a-z0-9._-]{2,29}"
            patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
            hiddenFields={{ profileId: profile.id }}
            confirmLabel="Release & rename"
            action={releaseUsernameAction}
            successToast="Username released"
          />
          {profile.suspendedAt ? (
            <ConfirmDialog
              trigger={<Button size="xs" variant="outline-strong">Unsuspend</Button>}
              title="Unsuspend this page?"
              body="The page returns to shoppers at its current address. Recorded in the audit log."
              confirmLabel="Unsuspend"
              tone="primary"
              action={unsuspendProfileAction}
              hiddenFields={{ profileId: profile.id }}
              successToast="Unsuspended"
            />
          ) : (
            <ConfirmDialog
              trigger={<Button size="xs" variant="destructive-outline">Suspend</Button>}
              title="Suspend profile"
              body="Only this creator page goes dark for shoppers. The owner can still sign in and manage other pages. Reversible — nothing is deleted. Recorded in the audit log."
              confirmLabel="Suspend"
              action={suspendProfileAction}
              hiddenFields={{ profileId: profile.id }}
              requireReason={{}}
              successToast="Suspended"
            />
          )}
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-3 gap-3.5">
        <StatTile label="Followers" value={profile.followerCount.toLocaleString()} />
        <StatTile label="Taps · 30d" value={profile.taps30d.toLocaleString()} />
        <StatTile label="Code copies · 30d" value={profile.codeCopies30d.toLocaleString()} />
      </div>

      <Panel className="mt-4 px-5 py-[18px]">
        <h2 className="font-display mb-3 text-[15px] font-bold">Posts · 12 newest</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {profile.posts.map((post) => (
            <div
              key={post.id}
              className="bg-muted border-border relative aspect-square overflow-hidden rounded-lg border"
            >
              <a
                href={post.mediaUrl}
                target="_blank"
                rel="noreferrer"
                title={post.caption ?? "View media"}
                className="absolute inset-0"
              >
                <span className="sr-only">{post.caption ?? "Post media"}</span>
              </a>
              <ConfirmDialog
                trigger={
                  <Button
                    size="xs"
                    variant="destructive"
                    className="absolute right-1 top-1 px-[7px] py-[3px] text-[10px]"
                  >
                    Remove
                  </Button>
                }
                title="Remove this post?"
                body="The post and its media come off Plugfolio. Tagged products stay live. This cannot be undone. Recorded in the audit log."
                confirmLabel="Remove post"
                action={deletePostAction}
                hiddenFields={{ postId: post.id }}
                successToast="Post removed"
              />
            </div>
          ))}
          {profile.posts.length === 0 ? (
            <p className="text-faint col-span-full py-6 text-center text-[13px]">No posts yet.</p>
          ) : null}
        </div>
      </Panel>

      <Panel className="mt-4 overflow-hidden px-5 py-[18px]">
        <h2 className="font-display mb-2 text-[15px] font-bold">Products</h2>
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Taps · 30d</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>
                  <Badge shape="square" variant="outline-muted">
                    {product.kind === "own" ? "Own" : "Affiliate"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {product.couponCode ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {product.taps30d.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDialog
                    trigger={<Button size="xs" variant="destructive-outline">Remove</Button>}
                    title="Remove this product?"
                    body="Removes the product and its recorded taps — the same cascade as a creator removing their own. This cannot be undone. Recorded in the audit log."
                    confirmLabel="Remove product"
                    action={deleteProductAction}
                    hiddenFields={{ productId: product.id }}
                    successToast="Product removed"
                  />
                </TableCell>
              </TableRow>
            ))}
            {profile.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-faint py-6 text-center">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel className="px-5 py-[18px]">
          <h2 className="font-display mb-1.5 text-[15px] font-bold">Managers</h2>
          {profile.managers.map((manager) => (
            <div
              key={manager.email}
              className="border-border flex justify-between border-t py-[9px] text-[13px]"
            >
              <span>{manager.email}</span>
              <span className="text-faint text-[11px] tabular-nums">
                {manager.since.toISOString().slice(0, 10)}
              </span>
            </div>
          ))}
          {profile.managers.length === 0 ? (
            <p className="text-faint border-border border-t py-5 text-center text-[13px]">
              No managers invited.
            </p>
          ) : null}
        </Panel>
        <Panel className="px-5 py-[18px]">
          <h2 className="font-display mb-2.5 text-[15px] font-bold">Categories</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.categories.map((category) => (
              <Badge key={category} shape="square" variant="outline-muted">
                {category}
              </Badge>
            ))}
            {profile.categories.length === 0 ? (
              <p className="text-faint text-[13px]">No categories.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
