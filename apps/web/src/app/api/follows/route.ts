import { UnauthorizedError, followProfile, followProfileInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/**
 * POST /api/follows — follow a creator (shopper account required, §2.2).
 * Thin controller (§6.3): verify session → validate → one service → shape.
 * The follower's identity comes from the session, never the body.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = followProfileInput.parse(await request.json());
    await followProfile(
      {
        follows: repositories.follows,
        comments: repositories.comments,
        profiles: repositories.profiles,
      },
      session.user.id,
      input.profileId,
    );
    return NextResponse.json({ following: true }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
