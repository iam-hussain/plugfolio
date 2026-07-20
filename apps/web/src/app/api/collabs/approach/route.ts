import { UnauthorizedError, approachRequirement, approachRequirementInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/** POST /api/collabs/approach — door one: a creator approaches a requirement. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = approachRequirementInput.parse(await request.json());
    const collabId = await approachRequirement(businessCollabDeps, session.user.id, input);
    return NextResponse.json({ collabId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
