/**
 * The three transactional emails (design/emails.html §7). These are the
 * account lifeline: each carries a one-time, 24-hour, single-use link, and if
 * it is not believed the reader is locked out with no other route in. So they
 * are written to survive suspicion, not to look like marketing — and rendered
 * to survive a mail client:
 *
 *   · No images, no CDN logo, no tracking pixel. Clients block remote images
 *     by default, so a design that leans on them arrives broken — and a
 *     blocked pixel in a security email is what a spam filter scores against
 *     you. These are the emails that must not land in spam.
 *   · The link is a button AND printed as text: buttons do not render
 *     everywhere, and a careful reader wants to read where a link goes before
 *     pressing it.
 *   · Expiry + single-use stated every time — "works once, expires in 24
 *     hours" is what separates a real security email from a forged one.
 *   · A did-not-expect-this line every time — the only defence a person has
 *     when a stranger types their address into a form.
 *
 * Production constraint (design comment): table-based HTML with fully inline
 * styles, a system font stack, and raw hex. These render in mail clients, not
 * the app, so token classes do not apply — the palette is inlined here.
 */

export type EmailContent = {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

// Inlined palette — mail clients strip <style>/classes, so every value rides
// on the element. Kept in sync with design/emails.html by hand.
const INK = "#12101C";
const MUTED = "#56506A";
const FAINT = "#8B8499";
const CANVAS = "#FCFBFE";
const SURFACE = "#FFFFFF";
const LINE = "#E9E4F0";
const VIOLET = "#7C3AED";
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Escape any interpolated value before it reaches HTML — names and URLs are
 * caller-supplied and must never be able to inject markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Layout = {
  /** Preview/subject already set separately; this heads the body. */
  readonly heading: string;
  /** Body paragraphs, in order — pre-built HTML (static copy is trusted). */
  readonly paragraphs: readonly string[];
  readonly ctaLabel: string;
  readonly url: string;
  /** A six-digit code shown under the button — the way in for a reader whose
   * in-app browser makes leaving and coming back a lost session (ADR-0024). */
  readonly code?: string;
  /** The expiry + single-use line (bordered, sits under the printed URL). */
  readonly metaLine: string;
  /** The "didn't ask for this" line — always present. */
  readonly disclaimerLine: string;
  /** Footer lines; the first is always the reply-to-a-human promise. */
  readonly footLines: readonly [string, string];
};

/**
 * The shared table shell. One centered surface card on the canvas ground,
 * every style inline. Dynamic values arriving here (`url`) are escaped by the
 * caller; the copy is static and trusted.
 */
function renderHtml(layout: Layout): string {
  const href = escapeHtml(layout.url);
  const paragraphs = layout.paragraphs
    .map((p) => `<p style="margin:0 0 14px;">${p}</p>`)
    .join("\n            ");
  const footer = layout.footLines.map(escapeHtml).join("<br>\n            ");
  const code = layout.code
    ? `<p style="margin:14px 0 0;padding:14px;border:1px solid ${LINE};border-radius:8px;text-align:center;font-size:13px;color:${MUTED};">` +
      `Or type this code into the verification screen:<br>` +
      `<strong style="display:inline-block;margin-top:6px;font-family:${MONO};font-size:26px;letter-spacing:0.18em;color:${INK};">${escapeHtml(layout.code)}</strong>` +
      `</p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:${CANVAS};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background-color:${CANVAS};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background-color:${SURFACE};border:1px solid ${LINE};border-radius:16px;">
        <tr>
          <td style="padding:22px 20px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
            <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;line-height:1.3;color:${INK};">${layout.heading}</h1>
            ${paragraphs}
            <p style="margin:0 0 14px;">
              <a href="${href}" style="display:inline-block;padding:13px 24px;border-radius:8px;background-color:${VIOLET};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;">${layout.ctaLabel}</a>
            </p>
            <p style="margin:14px 0 0;padding:11px 13px;border-radius:8px;background-color:${CANVAS};font-family:${MONO};font-size:12px;line-height:1.5;color:${MUTED};word-break:break-all;">${href}</p>
            ${code}
            <p style="margin:18px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:13px;color:${MUTED};">${layout.metaLine}</p>
            <p style="margin:8px 0 0;padding-top:8px;font-size:13px;color:${MUTED};">${layout.disclaimerLine}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 20px 18px;border-top:1px solid ${LINE};font-family:${FONT};font-size:12px;line-height:1.5;color:${FAINT};">
            ${footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Plain-text alternative: same copy, the URL alone on its own line so a
 * text-only client still gives the reader a link they can read and trust. */
function renderText(lines: readonly string[]): string {
  return `${lines.join("\n\n")}\n`;
}

const REPLY_LINE = "Plugfolio · Reply to this email and a person reads it.";

/* ── 1 · Verification ─────────────────────────────────────────────────────
   Sent once at registration. The account cannot sign in until the link is
   used, so it says that plainly — a reader who thinks it optional will try to
   log in, fail, and blame the password. */
export function verificationEmail(url: string, code: string): EmailContent {
  return {
    subject: `Confirm your email to finish signing up (${code})`,
    html: renderHtml({
      heading: "One tap and you&rsquo;re in.",
      paragraphs: [
        "You created a Plugfolio account with this address. Confirm it, pick your username, and " +
          "you can sign in.",
      ],
      ctaLabel: "Confirm my email",
      url,
      code,
      metaLine:
        `This link works <strong style="color:${INK};">once</strong> and expires in ` +
        `<strong style="color:${INK};">24 hours</strong>; the code lasts ` +
        `<strong style="color:${INK};">15 minutes</strong>. You can&rsquo;t sign in until one of ` +
        "them is used &mdash; if they run out, ask for a fresh email from the sign-in screen.",
      disclaimerLine:
        "Didn&rsquo;t sign up? Someone typed this address by mistake. Ignore this and nothing " +
        "happens &mdash; no account is created without this link.",
      footLines: [REPLY_LINE, "You received this because someone used this address to sign up."],
    }),
    text: renderText([
      "One tap and you're in.",
      "You created a Plugfolio account with this address. Confirm it, pick your username, and you " +
        "can sign in.",
      `Confirm your email:\n${url}`,
      `Or type this code into the verification screen: ${code}`,
      "This link works once and expires in 24 hours; the code lasts 15 minutes. You can't sign in " +
        "until one of them is used — if they run out, ask for a fresh email from the sign-in screen.",
      "Didn't sign up? Someone typed this address by mistake. Ignore this and nothing happens — " +
        "no account is created without this link.",
      REPLY_LINE,
    ]),
  };
}

/* ── 2 · Password reset ───────────────────────────────────────────────────
   Sent from /forgot, which never reveals whether an account exists. That
   promise only holds if this reads sensibly for BOTH the account holder and
   the stranger whose address was typed. */
export function passwordResetEmail(url: string): EmailContent {
  return {
    subject: "Reset your Plugfolio password",
    html: renderHtml({
      heading: "Set a new password.",
      paragraphs: [
        "Someone asked to reset the password for the Plugfolio account on this address.",
      ],
      ctaLabel: "Choose a new password",
      url,
      metaLine:
        `This link works <strong style="color:${INK};">once</strong> and expires in ` +
        `<strong style="color:${INK};">24 hours</strong>. Your current password keeps working ` +
        "until you set a new one.",
      disclaimerLine:
        "Didn&rsquo;t ask for this? Ignore it &mdash; nothing changes, and your password stays as " +
        "it is. If it keeps happening, reply and tell us.",
      footLines: [REPLY_LINE, "We never ask for your password by email."],
    }),
    text: renderText([
      "Set a new password.",
      "Someone asked to reset the password for the Plugfolio account on this address.",
      `Choose a new password:\n${url}`,
      "This link works once and expires in 24 hours. Your current password keeps working until " +
        "you set a new one.",
      "Didn't ask for this? Ignore it — nothing changes, and your password stays as it is. If it " +
        "keeps happening, reply and tell us.",
      REPLY_LINE,
    ]),
  };
}

export type ManagerInviteContext = {
  readonly url: string;
  /** Who invited them — leads the copy so a stranger knows who this is. */
  readonly inviterName: string;
  /** The profile they're being handed, bare (the "@" is added here). */
  readonly profileHandle: string;
};

/* ── 3 · Manager invite ───────────────────────────────────────────────────
   Only to an invitee with no password yet — someone who may never have heard
   of us, handed access to another person's profile. So it leads with WHO
   invited them and WHAT they can do before asking for anything. The link
   doubles as the first-password screen and verifies the address. */
export function managerInviteEmail(context: ManagerInviteContext): EmailContent {
  const inviter = escapeHtml(context.inviterName);
  const handle = `@${escapeHtml(context.profileHandle)}`;
  // Subject/text are plain strings (not markup), so they take the raw values.
  const rawHandle = `@${context.profileHandle}`;
  return {
    subject: `${context.inviterName} added you as a Manager on ${rawHandle}`,
    html: renderHtml({
      heading: `${inviter} added you to ${handle}.`,
      paragraphs: [
        `You can post on that profile and tag products onto posts. Its settings, connections and ` +
          `other Managers stay ${inviter}&rsquo;s.`,
        "Set a password and the profile is waiting in your dashboard.",
      ],
      ctaLabel: "Set my password",
      url: context.url,
      metaLine:
        `This link works <strong style="color:${INK};">once</strong> and expires in ` +
        `<strong style="color:${INK};">24 hours</strong>. It confirms your email at the same ` +
        "time, so there&rsquo;s nothing else to click.",
      disclaimerLine:
        `Don&rsquo;t know ${inviter}? Ignore this. You&rsquo;ll get no further email about it, ` +
        "and no account is created without this link.",
      footLines: [REPLY_LINE, `${context.inviterName} invited you.`],
    }),
    text: renderText([
      `${context.inviterName} added you to ${rawHandle}.`,
      "You can post on that profile and tag products onto posts. Its settings, connections and " +
        `other Managers stay ${context.inviterName}'s.`,
      "Set a password and the profile is waiting in your dashboard.",
      `Set my password:\n${context.url}`,
      "This link works once and expires in 24 hours. It confirms your email at the same time, so " +
        "there's nothing else to click.",
      `Don't know ${context.inviterName}? Ignore this. You'll get no further email about it, and ` +
        "no account is created without this link.",
      REPLY_LINE,
    ]),
  };
}
