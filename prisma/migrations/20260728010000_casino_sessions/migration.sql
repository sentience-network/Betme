-- CreateTable
CREATE TABLE "CasinoGameSession" (
    "id" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "payout" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resultJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CasinoGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CasinoGameSession_userId_createdAt_idx" ON "CasinoGameSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CasinoGameSession_gameType_status_createdAt_idx" ON "CasinoGameSession"("gameType", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "CasinoGameSession" ADD CONSTRAINT "CasinoGameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
