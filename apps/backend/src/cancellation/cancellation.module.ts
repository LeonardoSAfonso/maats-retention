import { Module } from "@nestjs/common";
import { CancellationRepository } from "./repository.js";

@Module({
  providers: [CancellationRepository],
  exports: [CancellationRepository],
})
export class CancellationModule {}

export default CancellationModule;
