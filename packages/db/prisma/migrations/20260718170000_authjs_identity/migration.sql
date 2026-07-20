-- Auth.js identity tables (ADR-0007). The creator "account" of ADR-0004 is the
-- Auth.js User row; the freed-up Account table becomes Auth.js provider links
-- (= connected socials). Hand-written RENAMEs preserve existing rows — a
-- generated diff would drop and recreate.

-- Account → User (same rows, new identity columns)
ALTER TABLE "Account" RENAME TO "User";
ALTER TABLE "User" RENAME CONSTRAINT "Account_pkey" TO "User_pkey";
ALTER INDEX "Account_email_key" RENAME TO "User_email_key";
ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3),
ADD COLUMN "name" TEXT,
ADD COLUMN "image" TEXT;

-- Profile.accountId → Profile.userId
ALTER TABLE "Profile" RENAME COLUMN "accountId" TO "userId";
ALTER TABLE "Profile" RENAME CONSTRAINT "Profile_accountId_fkey" TO "Profile_userId_fkey";
ALTER INDEX "Profile_accountId_idx" RENAME TO "Profile_userId_idx";

-- CreateTable (Auth.js provider links — connected socials per ADR-0004)
CREATE TABLE "Account" (
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
