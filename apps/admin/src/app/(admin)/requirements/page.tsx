import { searchRequirements } from "@plugfolio/core";
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Pager,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { Panel } from "@/components/panel";
import { pagedHref, pageQuery, type ListParams } from "@/lib/list-params";
import { repositories } from "@/server/container";
import { removeRequirementAction } from "./actions";

export const metadata: Metadata = { title: "Requirements" };
export const dynamic = "force-dynamic";

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const page = pageQuery(params);
  const { rows, total } = await searchRequirements(
    { requirements: repositories.requirements },
    params.q,
    page,
  );

  return (
    <>
      <PageHeader title="Requirements">
        <form className="flex flex-wrap items-center gap-2">
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title / brief / business"
            className="w-[280px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/requirements/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Brief</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Approaches</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((requirement) => (
              <TableRow key={requirement.id}>
                <TableCell className="max-w-[360px]">
                  <span className="block font-medium">{requirement.title}</span>
                  <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                    {requirement.brief}
                  </span>
                </TableCell>
                <TableCell className="text-[13px]">{requirement.businessName}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {requirement.budget ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {requirement.deadline ? requirement.deadline.toISOString().slice(0, 10) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {requirement.collabCount}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDialog
                    trigger={<Button size="xs" variant="destructive-outline">Remove</Button>}
                    title="Remove this requirement?"
                    body="The brief comes off the open board. Existing collab threads on it survive. Recorded in the audit log."
                    confirmLabel="Remove requirement"
                    action={removeRequirementAction}
                    hiddenFields={{ requirementId: requirement.id }}
                    successToast="Requirement removed"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No requirements match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/requirements", params)} />
    </>
  );
}
