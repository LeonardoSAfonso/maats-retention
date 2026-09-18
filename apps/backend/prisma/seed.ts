/* eslint-disable no-console */
/// <reference types="node" />
import process from "node:process";
import { PrismaClient, ReasonCategory } from "@prisma/client";
import { plans, scenarios } from "@repo/contracts";

const prisma = new PrismaClient();

const initialReasonKeywords: { term: string; category: ReasonCategory }[] = [
  // PRICE
  { term: "expensive", category: ReasonCategory.PRICE },
  { term: "preço", category: ReasonCategory.PRICE },
  { term: "preco", category: ReasonCategory.PRICE },
  { term: "caro", category: ReasonCategory.PRICE },
  { term: "custo", category: ReasonCategory.PRICE },
  { term: "worth the price", category: ReasonCategory.PRICE },
  { term: "worth continuing", category: ReasonCategory.PRICE },
  { term: "premium features", category: ReasonCategory.PRICE },
  { term: "valor", category: ReasonCategory.PRICE },
  { term: "mensalidade", category: ReasonCategory.PRICE },

  // LACK_OF_USE
  { term: "few months", category: ReasonCategory.LACK_OF_USE },
  { term: "traveling", category: ReasonCategory.LACK_OF_USE },
  { term: "viagem", category: ReasonCategory.LACK_OF_USE },
  { term: "tempo", category: ReasonCategory.LACK_OF_USE },
  { term: "pouco uso", category: ReasonCategory.LACK_OF_USE },
  { term: "não uso", category: ReasonCategory.LACK_OF_USE },
  { term: "nao uso", category: ReasonCategory.LACK_OF_USE },
  { term: "no longer using", category: ReasonCategory.LACK_OF_USE },
  { term: "sem tempo", category: ReasonCategory.LACK_OF_USE },

  // TECHNICAL_ISSUE
  { term: "bug", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "erro", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "técnico", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "tecnico", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "travando", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "lento", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "falha", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "technical", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "app", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "aplicativo", category: ReasonCategory.TECHNICAL_ISSUE },

  // COMPETITION
  { term: "concorrente", category: ReasonCategory.COMPETITION },
  { term: "concorrência", category: ReasonCategory.COMPETITION },
  { term: "concorrencia", category: ReasonCategory.COMPETITION },
  { term: "netflix", category: ReasonCategory.COMPETITION },
  { term: "prime", category: ReasonCategory.COMPETITION },
  { term: "disney", category: ReasonCategory.COMPETITION },
  { term: "outro", category: ReasonCategory.COMPETITION },
  { term: "outra", category: ReasonCategory.COMPETITION },
];

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

  // 3. Seed Reason Keywords
  for (const item of initialReasonKeywords) {
    await prisma.reasonKeyword.upsert({
      where: { term: item.term },
      create: item,
      update: { category: item.category },
    });
  }
  console.log(`✅ Palavras-chave de cancelamento inseridas: ${initialReasonKeywords.length}`);

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
