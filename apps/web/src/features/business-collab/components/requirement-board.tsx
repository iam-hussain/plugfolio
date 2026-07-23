import type { RequirementView } from "@plugfolio/core";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";
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

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

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
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>{requirement.businessName}</span>
                {requirement.budget ? <Badge variant="outline">{requirement.budget}</Badge> : null}
                {requirement.deadline ? (
                  <span>by {dateFormat.format(requirement.deadline)}</span>
                ) : null}
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
