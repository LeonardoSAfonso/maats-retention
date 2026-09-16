import { Module } from "@nestjs/common";
import { PlanRepository } from "./repository.js";

@Module({
  providers: [PlanRepository],
  exports: [PlanRepository],
})
export class PlanModule {}

export default PlanModule;
