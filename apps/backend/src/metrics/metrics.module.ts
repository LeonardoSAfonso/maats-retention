import { Module } from "@nestjs/common";
import { CancellationModule } from "../cancellation/cancellation.module.js";
import { MetricsController } from "./metrics.controller.js";

@Module({
  imports: [CancellationModule],
  controllers: [MetricsController],
})
export class MetricsModule {}

export default MetricsModule;
