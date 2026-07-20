-- Profile Managers (ADR-0004: one Admin + up to 3 Managers per profile).
-- See docs/implementation/profile-managers.md.

-- CreateTable
CREATE TABLE "ProfileManager" (
    "profileId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileManager_pkey" PRIMARY KEY ("profileId","userId")
);

-- CreateIndex
CREATE INDEX "ProfileManager_userId_idx" ON "ProfileManager"("userId");

-- AddForeignKey
ALTER TABLE "ProfileManager" ADD CONSTRAINT "ProfileManager_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileManager" ADD CONSTRAINT "ProfileManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

