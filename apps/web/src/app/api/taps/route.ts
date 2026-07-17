import { recordOutboundTap, recordOutboundTapInput } from "@plugfolio/core";
import { NextResponse } from "next/server";
import { clock, repositories } from "@/server/container";
import { toErrorResponse } from "@/server/http/error-response";

/**
 * POST /api/taps — record an outbound tap. Thin controller (§6.3):
 * validate → call one service → shape response. No business logic here.
 *
 * No account required (ADR-0002): the shopper is identified only by a signed
 * device token carried in the payload.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = recordOutboundTapInput.parse(await request.json());
    const tap = await recordOutboundTap({ taps: repositories.taps, now: clock.now }, input);
    return NextResponse.json({ tap }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
