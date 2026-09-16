import { PartialType } from "@nestjs/mapped-types";
import { CreateSubscriptionDTO } from "./create.dto.js";

export class UpdateSubscriptionDTO extends PartialType(CreateSubscriptionDTO) {}

export default UpdateSubscriptionDTO;
