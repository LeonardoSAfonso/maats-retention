import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { safeSerialize } from "../../utils/serialize.js";

/** Registra cada requisição HTTP em formato compacto. */
@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const method: string = request.method;
    const url: string = request.originalUrl;
    const startedAt = process.hrtime.bigint();

    response.on("close", () => {
      const statusCode = response.statusCode;
      const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
      const payload: string = safeSerialize(request.body as unknown);

      this.logger.log(
        `Received {${url}, ${method}, ${String(statusCode)}} \x1b[33m+${String(
          durationMs,
        )}ms\x1b[0m`,
      );

      this.logger.verbose(`Body ${payload}`);
    });

    next();
  }
}
