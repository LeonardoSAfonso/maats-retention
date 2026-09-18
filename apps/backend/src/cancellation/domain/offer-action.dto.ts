import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";
import { type AcceptOfferRequest, type DeclineOfferRequest, type UUID } from "@repo/contracts";

export class AcceptOfferDTO implements AcceptOfferRequest {
  @ApiProperty({
    description: "ID do cancelamento no formato UUIDv7",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @IsUUID()
  @IsNotEmpty()
  cancellationId!: UUID;
}

export class DeclineOfferDTO implements DeclineOfferRequest {
  @ApiProperty({
    description: "ID do cancelamento no formato UUIDv7",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @IsUUID()
  @IsNotEmpty()
  cancellationId!: UUID;
}
