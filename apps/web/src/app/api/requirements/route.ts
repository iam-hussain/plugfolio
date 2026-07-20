import { UnauthorizedError, postRequirement, postRequirementInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/** POST /api/requirements — post a brief to the open board (door one). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = postRequirementInput.parse(await request.json());
    const requirement = await postRequirement(businessCollabDeps, session.user.id, input);
    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
