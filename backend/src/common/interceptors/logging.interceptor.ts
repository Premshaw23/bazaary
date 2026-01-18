import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `${method} ${url} ${Date.now() - now}ms`,
          ),
        ),
        catchError((err) => {
          this.logger.error(
            `${method} ${url} ${Date.now() - now}ms - Error: ${err.message}`,
          );
          return throwError(() => err);
        }),
      );
  }
}
