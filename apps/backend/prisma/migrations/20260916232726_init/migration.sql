-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('LOGIN', 'PLAYBACK', 'DOWNLOAD', 'INTERACTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('ON_TIME', 'LATE', 'FAILED');

-- CreateEnum
CREATE TYPE "ReasonCategory" AS ENUM ('PRICE', 'LACK_OF_USE', 'TECHNICAL_ISSUE', 'COMPETITION', 'OTHER');

-- CreateEnum
CREATE TYPE "RiskBand" AS ENUM ('LOW', 'GREY', 'HIGH');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('DISCOUNT', 'UPGRADE', 'PAUSE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('CANCELLED', 'AUTOMATIC_OFFER', 'HUMAN_RETENTION');

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "cycle" "BillingCycle" NOT NULL,
    "benefits" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_events" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "type" "EngagementType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellations" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "raw_reason" TEXT NOT NULL,
    "reason_category" "ReasonCategory",
    "risk" DOUBLE PRECISION,
    "band" "RiskBand",
    "outcome_type" "OutcomeType",
    "human_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "cancellation_id" UUID NOT NULL,
    "type" "OfferType" NOT NULL,
    "amount_cents" INTEGER,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE INDEX "subscriptions_subscriber_id_idx" ON "subscriptions"("subscriber_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "engagement_events_subscription_id_idx" ON "engagement_events"("subscription_id");

-- CreateIndex
CREATE INDEX "engagement_events_occurred_at_idx" ON "engagement_events"("occurred_at");

-- CreateIndex
CREATE INDEX "payment_events_subscription_id_idx" ON "payment_events"("subscription_id");

-- CreateIndex
CREATE INDEX "payment_events_date_idx" ON "payment_events"("date");

-- CreateIndex
CREATE INDEX "cancellations_subscription_id_idx" ON "cancellations"("subscription_id");

-- CreateIndex
CREATE INDEX "cancellations_band_idx" ON "cancellations"("band");

-- CreateIndex
CREATE INDEX "cancellations_outcome_type_idx" ON "cancellations"("outcome_type");

-- CreateIndex
CREATE INDEX "cancellations_created_at_idx" ON "cancellations"("created_at");

-- CreateIndex
CREATE INDEX "offers_cancellation_id_idx" ON "offers"("cancellation_id");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_events" ADD CONSTRAINT "engagement_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_cancellation_id_fkey" FOREIGN KEY ("cancellation_id") REFERENCES "cancellations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
