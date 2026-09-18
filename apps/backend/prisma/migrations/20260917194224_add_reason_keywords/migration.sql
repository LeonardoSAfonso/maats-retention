-- CreateTable
CREATE TABLE "reason_keywords" (
    "id" UUID NOT NULL,
    "term" TEXT NOT NULL,
    "category" "ReasonCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reason_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reason_keywords_term_key" ON "reason_keywords"("term");

-- CreateIndex
CREATE INDEX "reason_keywords_category_idx" ON "reason_keywords"("category");
