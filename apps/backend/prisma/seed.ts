/* eslint-disable no-console */
/// <reference types="node" />
import process from "node:process";
import { PrismaClient } from "@prisma/client";
import { plans, scenarios } from "@repo/contracts";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Seed Plans (idempotent upsert)
  for (const plan of plans) {
    const { id, ...data } = plan;
    await prisma.plan.upsert({
      where: { id },
      create: plan,
      update: data,
    });
  }
  console.log(`✅ Planos inseridos: ${plans.length}`);

  // 2. Seed Scenarios (Subscribers, Subscriptions, Events)
  for (const scenario of scenarios) {
    // Subscriber
    const { id: subscriberId, ...subscriberData } = scenario.subscriber;
    await prisma.subscriber.upsert({
      where: { id: subscriberId },
      create: scenario.subscriber,
      update: subscriberData,
    });

    // Subscription
    const { id: subscriptionId, ...subscriptionData } = scenario.subscription;
    await prisma.subscription.upsert({
      where: { id: subscriptionId },
      create: scenario.subscription,
      update: subscriptionData,
    });

    // Engagement Events
    for (const event of scenario.engagementEvents) {
      const { id: eventId, ...eventData } = event;
      await prisma.engagementEvent.upsert({
        where: { id: eventId },
        create: event,
        update: eventData,
      });
    }

    // Payment Events
    for (const payment of scenario.paymentEvents) {
      const { id: paymentId, ...paymentData } = payment;
      await prisma.paymentEvent.upsert({
        where: { id: paymentId },
        create: payment,
        update: paymentData,
      });
    }
  }

  console.log(`✅ Cenários e assinantes inseridos: ${scenarios.length}`);
  console.log("🌱 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
