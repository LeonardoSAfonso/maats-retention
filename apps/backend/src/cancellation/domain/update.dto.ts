import { PartialType } from "@nestjs/mapped-types";
import { CreateCancellationDTO } from "./create.dto.js";

export class UpdateCancellationDTO extends PartialType(CreateCancellationDTO) {}

export default UpdateCancellationDTO;
