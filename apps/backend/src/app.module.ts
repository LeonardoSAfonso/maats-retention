import { type MiddlewareConsumer, type NestModule, Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AppLoggerMiddleware } from "./common/middlewares/app-logger.middleware.js";
import { OrmModule } from "./orm/orm.module.js";
import { PlanModule } from "./plan/plan.module.js";
import { SubscriberModule } from "./subscriber/subscriber.module.js";
import { SubscriptionModule } from "./subscription/subscription.module.js";
import { CancellationModule } from "./cancellation/cancellation.module.js";
import { OfferModule } from "./offer/offer.module.js";
import { EventModule } from "./event/event.module.js";

@Module({
  imports: [
    OrmModule,
    PlanModule,
    SubscriberModule,
    SubscriptionModule,
    CancellationModule,
    OfferModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("{*splat}");
  }
}
