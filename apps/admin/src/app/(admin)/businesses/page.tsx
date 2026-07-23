import { searchBusinesses } from "@plugfolio/core";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { ConfirmButton } from "@/components/confirm-button";
import { SearchHeader } from "@/components/search-header";
import { repositories } from "@/server/container";
import { clearLogoAction } from "./actions";

export const metadata: Metadata = { title: "Businesses" };
export const dynamic = "force-dynamic";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const businesses = await searchBusinesses({ businesses: repositories.businesses }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Businesses" query={q} placeholder="Search name, owner email…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.id}>
              <TableCell className="max-w-md">
                <p className="text-sm font-medium">{business.name}</p>
                <p className="text-muted-foreground truncate text-xs">{business.description}</p>
              </TableCell>
              <TableCell className="text-xs">{business.ownerEmail}</TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {business.requirementCount} requirements · {business.collabCount} collabs
              </TableCell>
              <TableCell>
                {business.ownerSuspendedAt ? (
                  <Badge variant="destructive">Owner suspended</Badge>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {business.logoUrl ? (
                  <form action={clearLogoAction}>
                    <input type="hidden" name="businessId" value={business.id} />
                    <ConfirmButton
                      size="sm"
                      variant="ghost"
                      message={`Remove ${business.name}'s logo? They can upload a new one.`}
                    >
                      Clear logo
                    </ConfirmButton>
                  </form>
                ) : (
                  <span className="text-muted-foreground text-xs">No logo</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No businesses match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
