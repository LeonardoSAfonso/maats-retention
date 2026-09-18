import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { type CreateCancellationRequest, type UUID } from "@repo/contracts";

export class CreateCancellationRequestDTO implements CreateCancellationRequest {
  @ApiProperty({
    description: "ID único da assinatura no formato UUIDv7",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId!: UUID;

  @ApiProperty({
    description: "Motivo informado em texto livre pelo assinante para o cancelamento",
    example: "O valor da mensalidade ficou muito caro para o meu orçamento atual.",
  })
  @IsString()
  @IsNotEmpty()
  rawReason!: string;
}

export default CreateCancellationRequestDTO;
