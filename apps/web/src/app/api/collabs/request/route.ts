import { UnauthorizedError, requestCollab, requestCollabInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/** POST /api/collabs/request — door two: a business reaches out to a creator. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = requestCollabInput.parse(await request.json());
    const collabId = await requestCollab(businessCollabDeps, session.user.id, input);
    return NextResponse.json({ collabId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
