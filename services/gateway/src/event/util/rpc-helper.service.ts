import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { AuthenticatedUser } from 'src/auth/decorators/user.decorator';

@Injectable()
export class RpcHelperService {
  private readonly logger = new Logger(RpcHelperService.name);

  async sendToEventService<T = any>(
    client: ClientProxy,
    pattern: any,
    data: any,
    user?: AuthenticatedUser,
  ): Promise<T> {
    const payload = user ? { ...data, userContext: user } : data;
    this.logger.debug(
      `Sending to Event Service. Pattern: ${JSON.stringify(pattern)}, Payload: ${JSON.stringify(payload).substring(0, 200)}...`,
    );

    try {
      return await firstValueFrom(
        client.send(pattern, payload).pipe(
          timeout(5000),
          catchError((err) => {
            this.logger.error(
              `Event Service communication error: ${err.message}`,
              err.stack,
            );
            if (err instanceof Object) {
              if (
                typeof err === 'object' &&
                err !== null &&
                'status' in err &&
                typeof err['status'] === 'number' &&
                'message' in err
              ) {
                throw new HttpException(err['message'], err['status']);
              }
              throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
            throw new HttpException(
              err.message || 'Event Service communication error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Error in sendToEventService: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to communicate with Event service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
