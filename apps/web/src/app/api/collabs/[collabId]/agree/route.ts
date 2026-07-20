import { UnauthorizedError, agreeCollab } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

const paramsSchema = z.object({ collabId: z.string().uuid() });

/**
 * POST /api/collabs/:collabId/agree — accept the terms for the caller's side.
 * Agreed once BOTH sides accept; money changes hands off-platform (§2.3).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ collabId: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { collabId } = paramsSchema.parse(await params);
    await agreeCollab(businessCollabDeps, session.user.id, collabId);
    return NextResponse.json({ agreed: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
