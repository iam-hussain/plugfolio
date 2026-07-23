import { searchRequirements } from "@plugfolio/core";
import {
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
import { removeRequirementAction } from "./actions";

export const metadata: Metadata = { title: "Requirements" };
export const dynamic = "force-dynamic";

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const requirements = await searchRequirements({ requirements: repositories.requirements }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Requirements" query={q} placeholder="Search title, brief, business…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brief</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Approaches</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((requirement) => (
            <TableRow key={requirement.id}>
              <TableCell className="max-w-md">
                <p className="text-sm font-medium">{requirement.title}</p>
                <p className="text-muted-foreground truncate text-xs">{requirement.brief}</p>
              </TableCell>
              <TableCell className="text-xs">{requirement.businessName}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {requirement.budget ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {requirement.deadline ? requirement.deadline.toISOString().slice(0, 10) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {requirement.collabCount}
              </TableCell>
              <TableCell className="text-right">
                <form action={removeRequirementAction}>
                  <input type="hidden" name="requirementId" value={requirement.id} />
                  <ConfirmButton
                    size="sm"
                    variant="destructive"
                    message="Remove this requirement from the board? Existing collab threads survive."
                  >
                    Remove
                  </ConfirmButton>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {requirements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                No requirements match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
