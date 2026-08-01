import {
  managerInviteEmail,
  passwordResetEmail,
  verificationEmail,
  type EmailContent,
} from "./email-templates";
import type { AuthMailer } from "../ports/auth-account-repository";

/**
 * Real mail transport (ADR-0015): Twilio's Email API via plain fetch — no SDK.
 * Same shape as the Resend adapter, wired env-gated in each composition root;
 * the console mailer stays the fallback when no credentials are configured.
 * The body copy/markup lives in email-templates.ts — this file is only the
 * transport.
 */

export type TwilioMailerConfig = {
  /** REST API key SID (`SK…`) — the Basic auth username. An API key rather
   * than the account auth token: scoped, revocable, and Twilio's own advice. */
  apiKeySid: string;
  apiKeySecret: string;
  /** e.g. "Plugfolio <no-reply@plugfolio.com>" or a bare address. */
  from: string;
};

/** Twilio wants `from` split; EMAIL_FROM carries the "Name <addr>" form. */
export function parseFrom(from: string): { address: string; name?: string } {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  if (!match) return { address: from.trim() };
  return { address: match[2] ?? from.trim(), name: match[1] || undefined };
}

async function send(config: TwilioMailerConfig, to: string, email: EmailContent): Promise<void> {
  const response = await fetch("https://comms.twilio.com/v1/Emails", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.apiKeySid}:${config.apiKeySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: parseFrom(config.from),
      to: [{ address: to }],
      // Both html and text: the multipart alternative lets a text-only client
      // still render the link, and improves deliverability on security mail.
      content: { subject: email.subject, html: email.html, text: email.text },
    }),
  });
  // 202 Accepted — the send is queued, not done. We don't poll the operation:
  // a queued auth link is delivered or bounced by Twilio, and blocking
  // registration on that round-trip buys nothing a bounce report can't tell us.
  if (!response.ok) {
    // Auth links are the account lifeline — surface delivery failures loudly.
    throw new Error(`Mail send failed (${response.status}): ${await response.text()}`);
  }
}

export function createTwilioMailer(config: TwilioMailerConfig): AuthMailer {
  return {
    async sendVerification(email, url) {
      await send(config, email, verificationEmail(url));
    },
    async sendPasswordReset(email, url) {
      await send(config, email, passwordResetEmail(url));
    },
    async sendManagerInvite(email, url, context) {
      await send(config, email, managerInviteEmail({ url, ...context }));
    },
  };
}
