ALTER TABLE "Document"
ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "documentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isImportant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Document_caseId_idx"
ON "Document"("caseId");

CREATE INDEX IF NOT EXISTS "Document_clientId_idx"
ON "Document"("clientId");

CREATE INDEX IF NOT EXISTS "Document_category_idx"
ON "Document"("category");

CREATE INDEX IF NOT EXISTS "Document_documentDate_idx"
ON "Document"("documentDate");
