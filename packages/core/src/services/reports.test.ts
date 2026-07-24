import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { NewReport, ReportWriteRepository } from "./reports";
import { createReport } from "./reports";

function makeDeps() {
  const created: NewReport[] = [];
  const reports: ReportWriteRepository = {
    async resolveTargetSnippet(type, targetId) {
      return targetId === "known" ? `${type} snippet` : null;
    },
    async create(report) {
      created.push(report);
    },
  };
  return { deps: { reports }, created };
}

describe("report inflow", () => {
  it("captures the snippet at report time and labels the reporter", async () => {
    const { deps, created } = makeDeps();
    await createReport(
      deps,
      { targetType: "comment", targetId: "known", category: "spam", note: "self promo" },
      { handle: "maya" },
    );
    expect(created[0]).toMatchObject({
      snippet: "comment snippet",
      reporterLabel: "@maya",
      note: "self promo",
    });

    await createReport(
      deps,
      { targetType: "product", targetId: "known", category: "scam" },
      { handle: null },
    );
    expect(created[1]).toMatchObject({ reporterLabel: "Anonymous shopper", note: null });
  });

  it("rejects unknown targets so random ids can't stuff the queue", async () => {
    const { deps, created } = makeDeps();
    await expect(
      createReport(
        deps,
        { targetType: "post", targetId: "ghost", category: "other" },
        { handle: null },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(created).toHaveLength(0);
  });
});
