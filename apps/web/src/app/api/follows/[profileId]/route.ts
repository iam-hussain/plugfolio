import { UnauthorizedError, followProfileInput, unfollowProfile } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/** DELETE /api/follows/:profileId — unfollow (idempotent no-op if not following). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { profileId } = followProfileInput.parse(await params);
    await unfollowProfile(
      {
        follows: repositories.follows,
        comments: repositories.comments,
        profiles: repositories.profiles,
      },
      session.user.id,
      profileId,
    );
    return NextResponse.json({ following: false });
  } catch (error) {
    return toErrorResponse(error);
  }
}
