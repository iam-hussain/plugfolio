import { Hono } from "hono";
import {
  NotFoundError,
  RateLimitedError,
  createFailureLimit,
  emailOnlyInput,
  identifierInput,
  registerAccount,
  registerInput,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  resetPasswordInput,
  verifyEmail,
  verifyEmailInput,
} from "@plugfolio/core";
import { accountAuthDeps, verifyEmailDeps } from "../container";

/**
 * Password auth (ADR-0012). NOT under /api/auth — that path belongs to Auth.js
 * in apps/web; login itself goes through the Credentials provider. These are the
 * register / verify / reset writes the sign-in screens post to.
 */
export const accountRoutes = new Hono();

// Six digits is a million guesses, and a 15-minute TTL alone doesn't stop a
// script (ADR-0024). Ten wrong codes per address per window; the link path is
// deliberately unlimited — guessing a 256-bit token is not a threat model.
const verifyCodeLimit = createFailureLimit({ windowMs: 15 * 60 * 1000, maxFailures: 10 });

accountRoutes.post("/account", async (c) => {
  const input = registerInput.parse(await c.req.json());
  await registerAccount(accountAuthDeps, input);
  return c.json({ registered: true }, 201);
});

accountRoutes.post("/account/verify", async (c) => {
  const input = verifyEmailInput.parse(await c.req.json());
  const codeKey = "code" in input ? input.email : null;
  if (codeKey && verifyCodeLimit.isLimited(codeKey)) {
    throw new RateLimitedError("Too many wrong codes — ask for a fresh email in 15 minutes");
  }
  try {
    await verifyEmail(verifyEmailDeps, input);
  } catch (error) {
    // Only a bad code counts against them — a taken handle (Conflict) is the
    // person getting the *proof* right, and must not spend their allowance.
    if (codeKey && error instanceof NotFoundError) verifyCodeLimit.recordFailure(codeKey);
    throw error;
  }
  if (codeKey) verifyCodeLimit.clear(codeKey);
  return c.json({ verified: true });
});

accountRoutes.post("/account/resend-verification", async (c) => {
  // Email or username — the sign-in screen may only know what was typed there.
  const input = identifierInput.parse(await c.req.json());
  await resendVerification(accountAuthDeps, input);
  return c.json({ sent: true });
});

accountRoutes.post("/account/reset-request", async (c) => {
  const input = emailOnlyInput.parse(await c.req.json());
  await requestPasswordReset(accountAuthDeps, input);
  // Always ok — never an existence oracle.
  return c.json({ sent: true });
});

accountRoutes.post("/account/reset", async (c) => {
  const input = resetPasswordInput.parse(await c.req.json());
  await resetPassword(accountAuthDeps, input);
  return c.json({ reset: true });
});
