import {
  managerInviteEmail,
  passwordResetEmail,
  verificationEmail,
  type EmailContent,
} from "./email-templates";
import type { AuthMailer } from "../ports/auth-account-repository";

/**
 * Real mail transport (ADR-0015): Resend's HTTP API via plain fetch — no SDK
 * dependency. Wired env-gated in each app's composition root; the console
 * mailer stays the fallback when no key is configured. The body copy/markup
 * lives in email-templates.ts — this file is only the transport.
 */

export type ResendMailerConfig = {
  apiKey: string;
  /** e.g. "Plugfolio <no-reply@plugfolio.com>" */
  from: string;
};

async function send(config: ResendMailerConfig, to: string, email: EmailContent): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    // Both html and text: the multipart alternative lets a text-only client
    // still render the link, and improves deliverability on security mail.
    body: JSON.stringify({
      from: config.from,
      to: [to],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  if (!response.ok) {
    // Auth links are the account lifeline — surface delivery failures loudly.
    throw new Error(`Mail send failed (${response.status}): ${await response.text()}`);
  }
}

export function createResendMailer(config: ResendMailerConfig): AuthMailer {
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
