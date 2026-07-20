import type { RequirementView } from "@plugfolio/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";
import { ApproachForm } from "./approach-form";

/**
 * The open requirements board. On the creator side (profileId set) each brief
 * carries an Approach form; the business side renders read-only.
 */
export type RequirementBoardProps = {
  requirements: readonly RequirementView[];
  /** The approaching creator profile; omit for a read-only board. */
  approachAsProfileId?: string;
};

export function RequirementBoard({ requirements, approachAsProfileId }: RequirementBoardProps) {
  if (requirements.length === 0) {
    return <p className="text-muted-foreground text-sm">No open requirements.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {requirements.map((requirement) => (
        <li key={requirement.id}>
          <Card>
            <CardHeader>
              <CardTitle>{requirement.title}</CardTitle>
              <CardDescription>
                {requirement.businessName}
                {requirement.budget ? ` · ${requirement.budget}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm">{requirement.brief}</p>
              {approachAsProfileId ? (
                <ApproachForm
                  requirementId={requirement.id}
                  profileId={approachAsProfileId}
                />
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
