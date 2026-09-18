import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { correlationStorage } from "./correlation.context.js";

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const headerId = request.headers["x-request-id"];
    const correlationId =
      (Array.isArray(headerId) ? headerId[0] : headerId)?.trim() || randomUUID();

    // Injeta o ID de correlação no header de resposta e no objeto de request
    response.setHeader("x-request-id", correlationId);
    (request as Request & { correlationId?: string }).correlationId = correlationId;

    correlationStorage.run({ correlationId }, () => {
      next();
    });
  }
}

export default CorrelationMiddleware;
