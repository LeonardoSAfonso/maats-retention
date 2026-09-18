import { IsNotEmpty, IsUUID } from "class-validator";
import { type AcceptOfferRequest, type DeclineOfferRequest, type UUID } from "@repo/contracts";

export class AcceptOfferDTO implements AcceptOfferRequest {
  @IsUUID()
  @IsNotEmpty()
  cancellationId!: UUID;
}

export class DeclineOfferDTO implements DeclineOfferRequest {
  @IsUUID()
  @IsNotEmpty()
  cancellationId!: UUID;
}
