import type { Meta, StoryObj } from "@storybook/react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";

/**
 * UI Kit · Table — the admin list surface (members, profiles, takedowns):
 * mono for handles, tabular nums for dates and counts, badges for status.
 */
const meta: Meta<typeof Table> = {
  title: "UI Kit/Table",
  component: Table,
};
export default meta;
type Story = StoryObj<typeof Table>;

const rows = [
  { handle: "@maya", role: "Creator · 1", status: "Active", joined: "2026-07-23" },
  { handle: "@verve-gear", role: "Business", status: "Unverified", joined: "2026-07-23" },
  { handle: "@user-0e92901c", role: "—", status: "Suspended", joined: "2026-07-22" },
];

export const AdminList: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>@handle</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.handle}>
            <TableCell className="font-mono text-xs">{row.handle}</TableCell>
            <TableCell>{row.role === "—" ? "—" : <Badge variant="secondary">{row.role}</Badge>}</TableCell>
            <TableCell>
              <Badge variant={row.status === "Suspended" ? "destructive" : "outline"}>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs tabular-nums">{row.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
