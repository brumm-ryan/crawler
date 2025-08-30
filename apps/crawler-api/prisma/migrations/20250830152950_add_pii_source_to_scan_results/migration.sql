-- AlterTable
ALTER TABLE "public"."scan_results" ADD COLUMN     "pii_source_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."scan_results" ADD CONSTRAINT "scan_results_pii_source_id_fkey" FOREIGN KEY ("pii_source_id") REFERENCES "public"."pii_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
