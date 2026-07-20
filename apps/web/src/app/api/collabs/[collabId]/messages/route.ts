import { UnauthorizedError, collabMessageInput, sendCollabMessage } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

const paramsSchema = z.object({ collabId: z.string().uuid() });

/** POST /api/collabs/:collabId/messages — bargain in the thread (participants only). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collabId: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { collabId } = paramsSchema.parse(await params);
    const input = collabMessageInput.parse(await request.json());
    await sendCollabMessage(businessCollabDeps, session.user.id, collabId, input);
    return NextResponse.json({ sent: true }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
