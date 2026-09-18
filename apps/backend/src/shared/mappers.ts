import {
  type Cancellation as PrismaCancellation,
  type EngagementEvent as PrismaEngagementEvent,
  type Offer as PrismaOffer,
  type PaymentEvent as PrismaPaymentEvent,
  type Plan as PrismaPlan,
  type Subscriber as PrismaSubscriber,
  type Subscription as PrismaSubscription,
} from "@prisma/client";
import {
  BillingCycle,
  EngagementType,
  OfferStatus,
  OfferType,
  OutcomeType,
  PaymentStatus,
  ReasonCategory,
  RiskBand,
  SubscriptionStatus,
  type Cancellation,
  type EngagementEvent,
  type Offer,
  type PaymentEvent,
  type Plan,
  type Subscriber,
  type Subscription,
  type UUID,
} from "@repo/contracts";

export function mapPlanToContract(plan: PrismaPlan): Plan {
  return {
    id: plan.id as UUID,
    name: plan.name,
    priceCents: plan.priceCents,
    cycle: plan.cycle as BillingCycle,
    benefits: plan.benefits,
    createdAt: plan.createdAt.toISOString(),
  };
}

export function mapSubscriberToContract(subscriber: PrismaSubscriber): Subscriber {
  return {
    id: subscriber.id as UUID,
    name: subscriber.name,
    email: subscriber.email,
    createdAt: subscriber.createdAt.toISOString(),
  };
}

export function mapSubscriptionToContract(subscription: PrismaSubscription): Subscription {
  return {
    id: subscription.id as UUID,
    subscriberId: subscription.subscriberId as UUID,
    planId: subscription.planId as UUID,
    startedAt: subscription.startedAt.toISOString(),
    status: subscription.status as SubscriptionStatus,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

export function mapEngagementEventToContract(event: PrismaEngagementEvent): EngagementEvent {
  return {
    id: event.id as UUID,
    subscriptionId: event.subscriptionId as UUID,
    type: event.type as EngagementType,
    occurredAt: event.occurredAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
  };
}

export function mapPaymentEventToContract(event: PrismaPaymentEvent): PaymentEvent {
  return {
    id: event.id as UUID,
    subscriptionId: event.subscriptionId as UUID,
    amountCents: event.amountCents,
    status: event.status as PaymentStatus,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
  };
}

export function mapOfferToContract(offer: PrismaOffer): Offer {
  return {
    id: offer.id as UUID,
    cancellationId: offer.cancellationId as UUID,
    type: offer.type as OfferType,
    status: offer.status as OfferStatus,
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    ...(offer.amountCents !== null && offer.amountCents !== undefined
      ? { amountCents: offer.amountCents }
      : {}),
  };
}

export function mapCancellationToContract(
  cancellation: PrismaCancellation & { offers?: PrismaOffer[] },
  offer?: PrismaOffer | null,
): Cancellation {
  const effectiveOffer = offer ?? cancellation.offers?.[0] ?? null;

  const outcome = cancellation.outcomeType
    ? {
        type: cancellation.outcomeType as OutcomeType,
        ...(effectiveOffer ? { offer: mapOfferToContract(effectiveOffer) } : {}),
        ...(cancellation.humanReason ? { humanReason: cancellation.humanReason } : {}),
      }
    : undefined;

  return {
    id: cancellation.id as UUID,
    subscriptionId: cancellation.subscriptionId as UUID,
    rawReason: cancellation.rawReason,
    createdAt: cancellation.createdAt.toISOString(),
    updatedAt: cancellation.updatedAt.toISOString(),
    ...(cancellation.reasonCategory
      ? { reasonCategory: cancellation.reasonCategory as ReasonCategory }
      : {}),
    ...(cancellation.risk !== null && cancellation.risk !== undefined
      ? { risk: cancellation.risk }
      : {}),
    ...(cancellation.band ? { band: cancellation.band as RiskBand } : {}),
    ...(outcome ? { outcome } : {}),
  };
}
