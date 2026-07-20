import { UnauthorizedError, createBusiness, createBusinessInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/** POST /api/businesses — create the caller's business (one per user in v1). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const input = createBusinessInput.parse(await request.json());
    const business = await createBusiness(businessCollabDeps, session.user.id, input);
    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
