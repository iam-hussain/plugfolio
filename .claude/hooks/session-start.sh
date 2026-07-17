#!/bin/bash
# SessionStart hook: install workspace deps and generate the Prisma client so
# Claude Code on the web can typecheck, lint, test, and build immediately.
set -euo pipefail

# Only run in remote (Claude Code on the web) sessions; local devs manage their
# own env via the README getting-started.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Use the pnpm version pinned in package.json's packageManager field.
corepack enable

# Reuse the container cache across runs; --frozen-lockfile matches CI.
pnpm install --frozen-lockfile

# Prisma client is generated (not committed) — required for typecheck/build.
pnpm db:generate
