import {
  BASELINE_RESERVED_USERNAMES,
  getFeatureFlags,
  getReservedUsernames,
} from "@plugfolio/core";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Reserved usernames</CardTitle>
          <CardDescription>
            Names no member handle (and, when username claiming lands, no profile username) may
            take. One per line; saved lowercase. The baseline below is always blocked and can’t be
            removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1">
            {BASELINE_RESERVED_USERNAMES.map((name) => (
              <Badge key={name} variant="outline" className="font-mono">
                {name}
              </Badge>
            ))}
          </div>
          <form action={saveReservedUsernamesAction} className="flex flex-col items-start gap-3">
            <Textarea
              name="usernames"
              defaultValue={reserved.join("\n")}
              rows={6}
              placeholder={"vip\nwinner\ngiveaway"}
              aria-label="Additional reserved usernames, one per line"
              className="font-mono"
            />
            <Button type="submit">Save reserved usernames</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>
            Runtime switches product code reads via <code>isFeatureEnabled</code>. Removing a flag
            returns that feature to its built-in default.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(flags).map(([name, enabled]) => (
                <TableRow key={name}>
                  <TableCell className="font-mono">{name}</TableCell>
                  <TableCell>
                    <Badge variant={enabled ? "secondary" : "outline"}>
                      {enabled ? "On" : "Off"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <form action={setFeatureFlagAction}>
                        <input type="hidden" name="name" value={name} />
                        <input type="hidden" name="enabled" value={String(!enabled)} />
                        <Button type="submit" size="sm" variant="secondary">
                          Turn {enabled ? "off" : "on"}
                        </Button>
                      </form>
                      <form action={removeFeatureFlagAction}>
                        <input type="hidden" name="name" value={name} />
                        <Button type="submit" size="sm" variant="ghost">
                          Remove
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(flags).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground text-center">
                    No flags set — everything runs on defaults.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <form action={setFeatureFlagAction} className="flex gap-2">
            <Input
              name="name"
              placeholder="new-flag-name"
              aria-label="New flag name"
              className="w-56 font-mono"
              required
            />
            <input type="hidden" name="enabled" value="true" />
            <Button type="submit" variant="secondary">
              Add flag (on)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
