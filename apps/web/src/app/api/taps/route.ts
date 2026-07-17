import { recordOutboundTap, recordOutboundTapInput } from "@plugfolio/core";
import { NextResponse, type NextRequest } from "next/server";
import { clock, repositories } from "@/server/container";
import { DEVICE_COOKIE, issueDeviceToken, verifyDeviceToken } from "@/server/device-token";
import { toErrorResponse } from "@/server/http/error-response";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * POST /api/taps — record an outbound tap. Thin controller (§6.3):
 * verify identity → validate → call one service → shape response.
 *
 * No account required (ADR-0002): the shopper is identified by a signed,
 * HTTP-only device cookie the server verifies (and issues on first contact) —
 * never by a value taken from the request body. The crediting profile is
 * derived from the product inside the service (§6.6), so neither identity nor
 * attribution is forgeable by the client.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const input = recordOutboundTapInput.parse(await request.json());

    // Trust only a deviceId we signed; mint a fresh identity if absent/forged.
    const cookieToken = request.cookies.get(DEVICE_COOKIE)?.value;
    const verified = verifyDeviceToken(cookieToken);
    const issued = verified ? null : issueDeviceToken();
    const deviceId = verified ?? issued!.deviceId;

    const tap = await recordOutboundTap(
      { taps: repositories.taps, products: repositories.products, now: clock.now },
      { ...input, deviceId },
    );

    const response = NextResponse.json({ tap }, { status: 201 });
    if (issued) {
      response.cookies.set(DEVICE_COOKIE, issued.token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });
    }
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
