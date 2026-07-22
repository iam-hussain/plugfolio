-- Password login (ADR-0012): registration verifies the email once; login is
-- email + password. Null hash = passwordless invited Manager.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
