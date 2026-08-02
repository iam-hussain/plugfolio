# Password auth — register, verify once (and name yourself), login, reset

**Journey served:** the lean journey's "How each account signs in" —
[ADR-0012](../adr/0012-password-login-with-registration-verification.md) (amends
ADR-0007) and [ADR-0024](../adr/0024-username-at-verification-and-as-a-login.md)
(username at verification; login by email **or** handle). Designer brief: [04-accounts-and-sign-in.md](../design/accounts/04-accounts-and-sign-in.md).

## Data model

Migration `20260722150000_password_auth`: `User.passwordHash String?` — scrypt
`salt:hash` via `node:crypto` (no new dependency). Null = passwordless invited Manager.
Tokens ride the existing Auth.js `VerificationToken` table, stored as **sha256 hashes**
(a leaked table grants nothing); the identifier encodes intent + email
(`verify:<email>` / `reset:<email>`), 24h TTL, single-use (deleted on touch, even when
expired). A verification send writes **two** rows on that identifier: the link's token, and
the six-digit code as `sha256("code:<email>:<code>")` on a **15-minute** TTL — six digits are
worthless without the address they were sent to. `User.username` is generated at
registration as a **placeholder** and replaced by the handle the person picks at
verification (ADR-0024).

## Services (`@plugfolio/core`, `services/account-auth.ts`)

- `registerAccount` — creates the user (placeholder handle), hashes, sends one
  verification email (link + code). Duplicate email → 409 (register may acknowledge
  existence; reset-request may not).
- `verifyEmail` — takes `{token, username}` **or** `{email, code, username}` and does both
  jobs at once: `peek` the token row, claim the handle through `updateMemberHandle`
  (reserved/taken → `ConflictError`), **then** consume and mark verified. Peek-before-consume
  is the point — a taken handle costs a retry, not the only link they have.
- `resendVerification` — re-issues by **email or handle** (`findByIdentifier`); quiet on
  unknown or already-verified accounts.
- `requestPasswordReset` — **never an existence oracle**: always resolves ok, sends only
  when the account exists.
- `resetPassword` — consumes a `reset:` token, sets the hash **and marks the email
  verified** — which is exactly the invited-Manager first-password path (their invite is
  "use forgot-password with your email" until invite mails are wired).
- `verifyCredentials` — resolves `identifier` (email **or** member handle, one `OR`
  lookup, both columns lower-cased) and gives one generic `invalid` for a wrong identifier
  OR password (constant-time compare); distinct `unverified` so the login page can offer
  resend. Admin sign-in keeps its own email-only `adminCredentialsInput` (ADR-0014's rate
  limiter is per address).

## API surface (`apps/api` — NOT under `/api/auth`, which belongs to Auth.js)

`POST /api/account` (register, 201) · `/account/verify` (token **or** email+code, plus the
username) · `/account/resend-verification` (email or handle) ·
`/account/reset-request` (always 200) · `/account/reset`. Links land on the web app;
base URL from `WEB_ORIGIN` (env, defaults to localhost). Mailer is console-logged
(`accountAuthDeps` in the container) until a transport lands.

## Login wiring (`apps/web/src/server/auth.ts`)

Auth.js **Credentials** provider calling `verifyCredentials`; its one identity field is
`identifier` (email or handle). Sessions **stay database
sessions** — apps/api validates cookies against the Session table (ADR-0008) — via the
documented workaround: the `jwt` callback creates a DB session row for credentials
sign-ins, and `jwt.encode` returns that session token as the cookie value (everything
else falls through to default encoding, keeping OAuth state cookies intact). The
magic-link provider is gone; `pages.signIn = "/signin"`. Unverified logins throw a
`CredentialsSignin` subclass with `code = "unverified"`, read client-side from
`signIn(..., { redirect: false })`.

Two guards this workaround needs: (1) Auth.js's `assertConfig` rejects
database-strategy + credentials when credentials is the **only** provider — since our
OAuth providers are env-gated, a placeholder Google provider (dummy credentials, never
shown on /signin) is registered when no real OAuth creds exist, purely to satisfy the
assert; (2) the `session` callback returns an **explicit** `{ expires, user: {id, name,
email, image} }` shape — with a database adapter the callback receives raw rows, and
returning them would leak `passwordHash`/`sessionToken` through `/api/auth/session`.
Dev seed: `creator@example.com` / `password123` is verified and can log in.

## Pages & components (feature `account-auth`)

Routes `(auth)/join · /signin · /verify · /forgot · /reset` on a shared centered layout.
`JoinScreen` (→ "check your email", carrying both *enter the code* and resend), `SignInScreen`
(one **Email or username** field; generic failure; distinct unverified state with resend;
`callbackUrl` honored), `ForgotForm` (always "check your email"), `ResetForm`, `VerifyScreen`,
`PasswordInput` (labeled show/hide). **`VerifyScreen` no longer auto-consumes on load** — it
is a form: with `?token=` it asks only for a username, without one it asks for email + the
six-digit code (`inputMode="numeric"`, `autocomplete="one-time-code"`) and the username. All former `/api/auth/signin` links/redirects now point at `/signin`.

**Inline shopper claim (brief 04):** `ClaimSheet` — the register form (email + password →
"check your email" with resend) in a bottom sheet OVER the page the shopper is on. Follow
(anonymous) and the "Sign in to comment" band (`CommentClaim`, creator + product pages) open
it instead of navigating to `/signin`; a Sign-in link inside covers existing accounts. The
pending follow/comment completes after verify + sign-in by tapping again — auto-resuming
the action is deferred (needs a pending-action store).

## Edge cases

- Verification link opened on another device: works — it verifies the account; the user
  signs in wherever they are. The code exists for the opposite case: staying on the device
  they registered on when the in-app browser would lose the tab.
- Whichever proof is used, the sibling row (code or link) is simply left to expire.
- The invited-Manager reset path does not ask for a handle — they keep the placeholder until
  settings (noted in ADR-0024).
- A verify token can't be spent as a reset token (intent prefix), and vice versa.
- Expired tokens are deleted on first touch; the error copy offers a fresh link.
- Invite emails for Managers are not sent yet (no transport) — the reset flow covers
  first passwords; wire a real invite mail alongside the mail provider.

## Verification

- Unit (13 in `account-auth.test.ts`): full register→verify→login lifecycle, duplicate 409,
  generic invalid, unverified gate, token single-use, intent isolation, expiry,
  reset-verifies (invited-Manager case), reset never an oracle — plus the ADR-0024 four:
  code verifies like the link, a code is worthless with the wrong address, a taken handle
  costs a retry and not the link, and the handle logs in with the same password.
- e2e URL expectations updated to `/signin`. No live DB here — the credentials-session
  recipe needs a real end-to-end pass (register → console link → verify → sign in →
  dashboard) on the first credentialed environment.

## Design system (ADR-0018)

The account screens' form vocabulary lives in `@plugfolio/ui` (DESIGN `auth.html`): `AuthForm`, `AuthField`, `AuthInput`, `AuthReveal`, `AuthConsequence`, `AuthAlternatives`, `AuthNotice`, `AuthStatus`.

- One column of at most 380px. The narrowness is the point — a sign-in that spans the measure reads as a form to fill in rather than a door to walk through.
- The password rule sits **under the box, always visible**: telling someone it's too short only after they submit is the same information delivered at the worst moment.
- The confirmation screens (check your email · verified · expired) are one `AuthStatus` each: a stamp, a sentence, and the one thing to do next.
- `AuthAlternatives` uses `items-center` deliberately — the links carry a 44px tap target and the text beside them doesn't, so under the default stretch they'd sit ~20px apart on a row that should share a baseline.

Stories: `Auth & Support/Forms`.
