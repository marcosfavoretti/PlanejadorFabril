import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FastApiStyleLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl } = request;
    const IP = context.switchToHttp().getRequest().ip;
    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const duration = Date.now() - now;
        this.logger.debug(
          `${IP} ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
