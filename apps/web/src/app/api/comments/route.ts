import { UnauthorizedError, addComment, addCommentInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/**
 * POST /api/comments — comment on a creator's page (shopper account required,
 * §2.2; reading comments stays account-free). Author = session, never body.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = addCommentInput.parse(await request.json());
    const comment = await addComment(
      {
        follows: repositories.follows,
        comments: repositories.comments,
        profiles: repositories.profiles,
      },
      session.user.id,
      input,
    );
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
