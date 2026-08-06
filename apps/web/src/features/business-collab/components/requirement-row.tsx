import type { RequirementView } from "@plugfolio/core";
import {
  ApproachCount,
  Badge,
  RequirementBrief,
  RequirementCard,
  RequirementHeader,
  RequirementMeta,
  RequirementTitle,
} from "@plugfolio/ui";
import { shortDate } from "@/lib/format-date";
import { CloseRequirementButton } from "./close-requirement-button";

/**
 * One brief on the business's own board — open or closed.
 *
 * v1 HANDLES NO MONEY: `budget` is free text and is rendered as free text. It
 * is never parsed, formatted or validated as currency, because doing so would
 * imply a rail that does not exist (§2.3).
 */
export function RequirementRow({ requirement }: { requirement: RequirementView }) {
  const closed = requirement.closedAt !== null;
  const state = closed ? "closed" : "open";

  return (
    <RequirementCard state={state}>
      <RequirementHeader>
        <RequirementTitle state={state}>{requirement.title}</RequirementTitle>
        {closed ? (
          <Badge variant="secondary">Closed</Badge>
        ) : (
          <CloseRequirementButton requirementId={requirement.id} />
        )}
      </RequirementHeader>

      <RequirementMeta>
        {requirement.budget ? <span>Budget {requirement.budget}</span> : null}
        {requirement.deadline ? <span>By {shortDate(requirement.deadline)}</span> : null}
        {/* "no approaches yet", not "0" — a zero beside a brief posted an hour
            ago reads as failure. */}
        <ApproachCount tone={requirement.approachCount === 0 ? "none" : "some"}>
          {requirement.approachCount === 0
            ? "no approaches yet"
            : `${requirement.approachCount} approached`}
        </ApproachCount>
        {closed ? <span>Existing threads continue</span> : null}
      </RequirementMeta>

      <RequirementBrief state={state}>{requirement.brief}</RequirementBrief>
    </RequirementCard>
  );
}
