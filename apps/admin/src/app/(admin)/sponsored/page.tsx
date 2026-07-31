import { ADS_FLAG, getFeatureFlags, listAdPlacements } from "@plugfolio/core";
import {
  ActionForm,
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/panel";
import { repositories } from "@/server/container";
import { createPlacementAction, removePlacementAction } from "./actions";

/**
 * Sponsored placements (ADR-0020) — the only way an ad reaches Explore.
 *
 * There is no plan and no self-serve purchase: an operator agrees a deal
 * off-platform and places it here. The slot shows nothing until the `ads` flag
 * is switched on in Settings, and that flag is off by default.
 */
export const metadata: Metadata = { title: "Sponsored" };
export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

export default async function SponsoredPage() {
  const [placements, flags] = await Promise.all([
    listAdPlacements({ ads: repositories.ads }),
    getFeatureFlags({ settings: repositories.settings }),
  ]);
  const live = flags[ADS_FLAG] === true;
  const now = new Date();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-name mb-5 font-bold tracking-[-0.02em]">Sponsored</h1>

      <Panel className="px-6 py-[22px]">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-body font-bold">The slot is {live ? "on" : "off"}</h2>
          <Badge variant={live ? "soft-primary" : "outline-muted"} shape="square">
            {live ? "ads enabled" : "ads disabled"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-label mb-3.5 mt-1.5 leading-[1.55]">
          Explore shows one slot per page, and only while the <code>ads</code> flag is on. It is off
          by default — an ad nobody remembered enabling is a worse failure than a missing one. Turn
          it on in{" "}
          <Link href="/settings" className="underline underline-offset-2">
            Settings → Feature flags
          </Link>
          .
        </p>
        <p className="text-muted-foreground text-label leading-[1.55]">
          Placements are agreed off-platform. Plugfolio takes no payment here and does no targeting
          — a placement is shown to everyone or to nobody.
        </p>
      </Panel>

      <Panel className="mt-4 px-6 py-[22px]">
        <h2 className="font-display text-body font-bold">Place one</h2>
        <p className="text-muted-foreground text-label mb-3.5 mt-1.5 leading-[1.55]">
          The newest live placement is the one that shows, so replacing what&apos;s running means
          adding a new one — not hunting for the old one first.
        </p>
        <ActionForm action={createPlacementAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold">Title</span>
            <Input
              name="title"
              maxLength={80}
              required
              placeholder="Aster — the notebook that lies flat"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold">Description</span>
            <Textarea
              name="description"
              maxLength={160}
              rows={2}
              placeholder="Made in Chennai. Free shipping over ₹999."
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold">Link</span>
            <Input name="url" type="url" required placeholder="https://…" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold">Image URL</span>
            <Input name="imageUrl" type="url" placeholder="https://…/square.jpg" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-semibold">Runs until (optional)</span>
            <Input name="activeUntil" type="date" />
            <span className="text-muted-foreground text-micro">
              Leave empty and it runs until someone stops it.
            </span>
          </label>
          <Button type="submit" size="sm" className="self-start">
            Place it
          </Button>
        </ActionForm>
      </Panel>

      <Panel className="mt-4 px-6 py-[22px]">
        <h2 className="font-display text-body mb-3.5 font-bold">Placements</h2>
        {placements.length === 0 ? (
          <p className="text-muted-foreground text-label">Nothing placed yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead>State</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((placement) => {
                const ended = placement.activeUntil !== null && placement.activeUntil <= now;
                const started = placement.activeFrom <= now;
                return (
                  <TableRow key={placement.id}>
                    <TableCell className="font-medium">{placement.title}</TableCell>
                    <TableCell className="text-muted-foreground text-label">
                      {when.format(placement.activeFrom)} →{" "}
                      {placement.activeUntil ? when.format(placement.activeUntil) : "open"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ended || !started ? "outline-muted" : "soft-primary"}
                        shape="square"
                      >
                        {ended ? "ended" : started ? "running" : "scheduled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmDialog
                        action={removePlacementAction}
                        hiddenFields={{ id: placement.id }}
                        title="Pull this placement?"
                        body="It stops showing immediately. Nothing else changes."
                        confirmLabel="Pull it"
                        trigger={
                          <Button variant="destructive-outline" size="xs">
                            Pull
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
