import { searchBusinesses } from "@plugfolio/core";
import {
  Badge,
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
import { clearLogoAction } from "./actions";

export const metadata: Metadata = { title: "Businesses" };
export const dynamic = "force-dynamic";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const page = pageQuery(params);
  const { rows, total } = await searchBusinesses(
    { businesses: repositories.businesses },
    params.q,
    page,
  );

  return (
    <>
      <PageHeader title="Businesses">
        <form className="flex flex-wrap items-center gap-2">
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search name / description / owner"
            className="w-[280px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/businesses/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="max-w-[340px]">
                  <span className="block font-semibold">{business.name}</span>
                  <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                    {business.description}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-[13px]">
                  {business.ownerEmail}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {business.requirementCount} requirement{business.requirementCount === 1 ? "" : "s"} ·{" "}
                  {business.collabCount} collab{business.collabCount === 1 ? "" : "s"}
                </TableCell>
                <TableCell>
                  {business.ownerSuspendedAt ? (
                    <Badge shape="square" variant="soft-destructive">Owner suspended</Badge>
                  ) : (
                    <Badge shape="square" variant="outline-muted">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {business.logoUrl ? (
                    <ConfirmDialog
                      trigger={<Button size="xs" variant="ghost-muted">Clear logo</Button>}
                      title="Clear this logo?"
                      body="The uploaded logo is removed and the business shows its default mark. Recorded in the audit log."
                      confirmLabel="Clear logo"
                      action={clearLogoAction}
                      hiddenFields={{ businessId: business.id }}
                      successToast="Logo cleared"
                    />
                  ) : (
                    <span className="text-faint text-xs">No logo</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-faint py-8 text-center">
                  No businesses match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/businesses", params)} />
    </>
  );
}
