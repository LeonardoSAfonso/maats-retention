import { Module } from "@nestjs/common";
import { ReasonKeywordRepository } from "./repository.js";

@Module({
  providers: [ReasonKeywordRepository],
  exports: [ReasonKeywordRepository],
})
export class ReasonKeywordModule {}

export default ReasonKeywordModule;
