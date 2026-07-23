import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

const AUDIT_PAGE_SIZE = 100;

export default async function AuditPage() {
  const entries = await repositories.audit.listRecent(AUDIT_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Audit log</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {entry.createdAt.toISOString().replace("T", " ").slice(0, 16)}
              </TableCell>
              <TableCell className="text-xs">{entry.adminEmail}</TableCell>
              <TableCell className="font-mono text-xs">{entry.action}</TableCell>
              <TableCell className="font-mono text-xs">
                {entry.targetType ? `${entry.targetType}:${entry.targetId ?? ""}` : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-md truncate text-xs">
                {entry.detail ?? "—"}
              </TableCell>
            </TableRow>
          ))}
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                Nothing yet — admin mutations land here.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
