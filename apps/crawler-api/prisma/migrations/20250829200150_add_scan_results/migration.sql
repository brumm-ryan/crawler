-- CreateTable
CREATE TABLE "public"."scan_results" (
    "id" SERIAL NOT NULL,
    "scan_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" JSONB,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scan_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."scan_results" ADD CONSTRAINT "scan_results_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
