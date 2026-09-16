import { PartialType } from "@nestjs/mapped-types";
import { CreatePlanDTO } from "./create.dto.js";

export class UpdatePlanDTO extends PartialType(CreatePlanDTO) {}

export default UpdatePlanDTO;
