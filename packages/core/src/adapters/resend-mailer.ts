import type { AuthMailer } from "../ports/auth-account-repository";

/**
 * Real mail transport (ADR-0015): Resend's HTTP API via plain fetch — no SDK
 * dependency. Wired env-gated in each app's composition root; the console
 * mailer stays the fallback when no key is configured.
 */

export type ResendMailerConfig = {
  apiKey: string;
  /** e.g. "Plugfolio <no-reply@plugfolio.com>" */
  from: string;
};

async function send(
  config: ResendMailerConfig,
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.from, to: [to], subject, text }),
  });
  if (!response.ok) {
    // Auth links are the account lifeline — surface delivery failures loudly.
    throw new Error(`Mail send failed (${response.status}): ${await response.text()}`);
  }
}

export function createResendMailer(config: ResendMailerConfig): AuthMailer {
  return {
    async sendVerification(email, url) {
      await send(
        config,
        email,
        "Verify your Plugfolio email",
        `One click and your account is live:\n\n${url}\n\nThe link is valid for 24 hours. If you didn't sign up, ignore this email.`,
      );
    },
    async sendPasswordReset(email, url) {
      await send(
        config,
        email,
        "Set your Plugfolio password",
        `Use this link to set a new password:\n\n${url}\n\nThe link is valid for 24 hours and works once. If you didn't request it, ignore this email.`,
      );
    },
  };
}
