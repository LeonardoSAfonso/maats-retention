import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { type CreateCancellationRequest, type UUID } from "@repo/contracts";

export class CreateCancellationRequestDTO implements CreateCancellationRequest {
  @IsUUID()
  @IsNotEmpty()
  subscriptionId!: UUID;

  @IsString()
  @IsNotEmpty()
  rawReason!: string;
}

export default CreateCancellationRequestDTO;
