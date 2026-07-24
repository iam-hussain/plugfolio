import {
  BASELINE_RESERVED_USERNAMES,
  getFeatureFlags,
  getReservedUsernames,
} from "@plugfolio/core";
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
import { Panel } from "@/components/panel";
import { repositories } from "@/server/container";
import {
  removeFeatureFlagAction,
  saveReservedUsernamesAction,
  setFeatureFlagAction,
} from "./actions";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const deps = { settings: repositories.settings };
  const [reserved, flags] = await Promise.all([getReservedUsernames(deps), getFeatureFlags(deps)]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display mb-5 text-2xl font-bold tracking-[-0.02em]">Settings</h1>

      <Panel className="px-6 py-[22px]">
        <h2 className="font-display text-base font-bold">Reserved usernames</h2>
        <p className="text-muted-foreground mb-3.5 mt-1.5 text-[13px] leading-[1.55]">
          Names no member handle — and, when username claiming lands, no profile username — may
          take.
        </p>
        <p className="font-mono text-faint mb-2 text-[10px] font-bold uppercase tracking-[0.1em]">
          Always blocked
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {BASELINE_RESERVED_USERNAMES.map((name) => (
            <Badge key={name} shape="square" variant="outline-muted" className="font-mono opacity-75">
              {name}
            </Badge>
          ))}
        </div>
        <p className="font-mono text-faint mb-2 text-[10px] font-bold uppercase tracking-[0.1em]">
          Admin additions
        </p>
        <ActionForm action={saveReservedUsernamesAction} successToast="Reserved usernames saved">
          <Textarea
            name="usernames"
            defaultValue={reserved.join("\n")}
            rows={4}
            placeholder={"vip\nwinner\ngiveaway"}
            aria-label="Additional reserved usernames, one per line"
            className="font-mono resize-y leading-[1.6]"
          />
          <div className="mt-3.5">
            <Button type="submit" size="xs">
              Save reserved usernames
            </Button>
          </div>
        </ActionForm>
      </Panel>

      <Panel className="mt-4 px-6 py-[22px]">
        <h2 className="font-display text-base font-bold">Feature flags</h2>
        <p className="text-muted-foreground mb-3.5 mt-1.5 text-[13px] leading-[1.55]">
          Removing a flag returns the feature to its built-in default.
        </p>
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead>State</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(flags).map(([name, enabled]) => (
              <TableRow key={name}>
                <TableCell className="font-mono text-xs">{name}</TableCell>
                <TableCell>
                  <Badge shape="square" variant={enabled ? "soft-primary" : "outline-muted"}>
                    {enabled ? "On" : "Off"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex justify-end gap-1.5">
                    <ActionForm
                      action={setFeatureFlagAction}
                      hiddenFields={{ name, enabled: String(!enabled) }}
                      successToast={`Flag ${name} turned ${enabled ? "off" : "on"}`}
                    >
                      <Button type="submit" size="xs" variant="outline-strong">
                        Turn {enabled ? "off" : "on"}
                      </Button>
                    </ActionForm>
                    <ConfirmDialog
                      trigger={<Button size="xs" variant="ghost-muted">Remove</Button>}
                      title="Remove this flag?"
                      body="The feature returns to its built-in default. Recorded in the audit log."
                      confirmLabel="Remove flag"
                      action={removeFeatureFlagAction}
                      hiddenFields={{ name }}
                      successToast="Flag removed"
                    />
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(flags).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-faint py-6 text-center">
                  No flags set — everything runs on defaults.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <ActionForm
          action={setFeatureFlagAction}
          hiddenFields={{ enabled: "true" }}
          successToast="Flag added"
          className="mt-3.5 flex gap-2"
        >
          <Input
            name="name"
            placeholder="new-flag-name"
            aria-label="New flag name"
            required
            className="font-mono max-w-[280px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Add flag (on)
          </Button>
        </ActionForm>
      </Panel>
    </div>
  );
}
