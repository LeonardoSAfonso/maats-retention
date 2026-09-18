import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  type CancellationDetailResponse,
  type ClassificationAgent,
  type ClassificationInput,
  type CreateCancellationRequest,
  type CreateCancellationResponse,
  type MetricsResponse,
  type OfferActionResponse,
  OfferStatus,
  OfferType,
  OutcomeType,
  ReasonCategory,
  SCORING_TIMEOUT_MS,
  type ScoringAgent,
  type ScoringInput,
  SubscriptionStatus,
} from "@repo/contracts";
import { CLASSIFICATION_AGENT, SCORING_AGENT } from "../agent/tokens.js";
import {
  calculateDiscountAmount,
  evaluateRetentionDecision,
  isHighValuePrice,
} from "../decision/decision-engine.js";
import { EventRepository } from "../event/repository.js";
import { OfferRepository } from "../offer/repository.js";
import { PlanRepository } from "../plan/repository.js";
import {
  mapCancellationToContract,
  mapEngagementEventToContract,
  mapOfferToContract,
  mapPaymentEventToContract,
  mapPlanToContract,
  mapSubscriberToContract,
  mapSubscriptionToContract,
} from "../shared/mappers.js";
import { withTimeout } from "../shared/timeout.js";
import { SubscriptionRepository } from "../subscription/repository.js";
import { CancellationRepository } from "./repository.js";

@Injectable()
export class CancellationService {
  private readonly logger = new Logger(CancellationService.name);

  constructor(
    @Inject(SCORING_AGENT) private readonly scoringAgent: ScoringAgent,
    @Inject(CLASSIFICATION_AGENT)
    private readonly classificationAgent: ClassificationAgent,
    private readonly cancellationRepository: CancellationRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: PlanRepository,
    private readonly offerRepository: OfferRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  public async processCancellation(
    dto: CreateCancellationRequest,
  ): Promise<CreateCancellationResponse> {
    const subscription = await this.subscriptionRepository.findById(dto.subscriptionId);
    if (!subscription || !subscription.subscriber || !subscription.plan) {
      throw new NotFoundException(`Subscription not found: ${dto.subscriptionId}`);
    }

    const [engagementEvents, paymentEvents] = await Promise.all([
      this.eventRepository.findEngagementBySubscriptionId(subscription.id),
      this.eventRepository.findPaymentsBySubscriptionId(subscription.id),
    ]);

    const scoringInput: ScoringInput = {
      subscriber: mapSubscriberToContract(subscription.subscriber),
      subscription: mapSubscriptionToContract(subscription),
      plan: mapPlanToContract(subscription.plan),
      engagementEvents: engagementEvents.map(mapEngagementEventToContract),
      paymentEvents: paymentEvents.map(mapPaymentEventToContract),
      rawReason: dto.rawReason,
    };

    const classificationInput: ClassificationInput = {
      rawReason: dto.rawReason,
      subscription: mapSubscriptionToContract(subscription),
    };

    const [scoringResult, classificationResult, distinctPrices] = await Promise.all([
      withTimeout(this.scoringAgent.score(scoringInput), SCORING_TIMEOUT_MS, () => ({
        risk: undefined as unknown as number,
        timedOut: true,
        latencyMs: SCORING_TIMEOUT_MS,
      })),
      this.classificationAgent.classify(classificationInput).catch((error) => {
        this.logger.warn(
          `ClassificationAgent failed, defaulting to OTHER: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return {
          category: ReasonCategory.OTHER,
          confidence: 0,
          latencyMs: 0,
        };
      }),
      this.planRepository.findDistinctPriceCents(),
    ]);

    const isHighValue = isHighValuePrice(subscription.plan.priceCents, distinctPrices);
    const decision = evaluateRetentionDecision({
      risk: scoringResult.risk,
      isHighValuePlan: isHighValue,
      timedOut: scoringResult.timedOut,
    });

    this.logger.log(
      `Cancellation for subscription ${subscription.id} resolved: band=${decision.band}, outcome=${decision.outcomeType}, reason=${decision.humanReason ?? "none"}`,
    );

    const cancellation = await this.cancellationRepository.create({
      subscriptionId: subscription.id,
      rawReason: dto.rawReason,
      reasonCategory: classificationResult.category,
      risk: scoringResult.timedOut || scoringResult.risk === undefined ? null : scoringResult.risk,
      band: decision.band,
      outcomeType: decision.outcomeType,
      humanReason: decision.humanReason ?? null,
    });

    let offerRecord = null;
    if (decision.outcomeType === OutcomeType.AUTOMATIC_OFFER) {
      const discountAmount = calculateDiscountAmount(subscription.plan.priceCents);
      offerRecord = await this.offerRepository.create({
        cancellationId: cancellation.id,
        type: OfferType.DISCOUNT,
        amountCents: discountAmount,
        status: OfferStatus.PENDING,
      });
    } else if (decision.outcomeType === OutcomeType.CANCELLED) {
      await this.subscriptionRepository.updateStatus(subscription.id, SubscriptionStatus.CANCELLED);
    }

    return {
      cancellation: mapCancellationToContract(cancellation, offerRecord),
    };
  }

  public async findById(id: string): Promise<CancellationDetailResponse> {
    const cancellation = await this.cancellationRepository.findById(id);
    if (!cancellation) {
      throw new NotFoundException(`Cancellation not found: ${id}`);
    }

    const subscription = await this.subscriptionRepository.findById(cancellation.subscriptionId);
    if (!subscription || !subscription.subscriber || !subscription.plan) {
      throw new NotFoundException(`Related subscription not found for cancellation: ${id}`);
    }

    return {
      cancellation: mapCancellationToContract(cancellation),
      subscription: mapSubscriptionToContract(subscription),
      subscriber: mapSubscriberToContract(subscription.subscriber),
      plan: mapPlanToContract(subscription.plan),
    };
  }

  public async acceptOffer(cancellationId: string): Promise<OfferActionResponse> {
    const cancellation = await this.cancellationRepository.findById(cancellationId);
    if (!cancellation) {
      throw new NotFoundException(`Cancellation not found: ${cancellationId}`);
    }

    const pendingOffer = cancellation.offers?.find((o) => o.status === OfferStatus.PENDING);
    if (!pendingOffer) {
      throw new BadRequestException("No pending offer found for this cancellation");
    }

    const updatedOffer = await this.offerRepository.update(pendingOffer.id, {
      status: OfferStatus.ACCEPTED,
    });

    await this.subscriptionRepository.updateStatus(
      cancellation.subscriptionId,
      SubscriptionStatus.ACTIVE,
    );

    return {
      offer: mapOfferToContract(updatedOffer),
      cancellation: mapCancellationToContract(cancellation, updatedOffer),
    };
  }

  public async declineOffer(cancellationId: string): Promise<OfferActionResponse> {
    const cancellation = await this.cancellationRepository.findById(cancellationId);
    if (!cancellation) {
      throw new NotFoundException(`Cancellation not found: ${cancellationId}`);
    }

    const pendingOffer = cancellation.offers?.find((o) => o.status === OfferStatus.PENDING);
    if (!pendingOffer) {
      throw new BadRequestException("No pending offer found for this cancellation");
    }

    const updatedOffer = await this.offerRepository.update(pendingOffer.id, {
      status: OfferStatus.DECLINED,
    });

    await this.subscriptionRepository.updateStatus(
      cancellation.subscriptionId,
      SubscriptionStatus.CANCELLED,
    );

    return {
      offer: mapOfferToContract(updatedOffer),
      cancellation: mapCancellationToContract(cancellation, updatedOffer),
    };
  }

  public async getMetrics(): Promise<MetricsResponse> {
    return this.cancellationRepository.getMetrics();
  }
}

export default CancellationService;
