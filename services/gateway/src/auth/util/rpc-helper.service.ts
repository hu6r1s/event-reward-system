import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { Observable, catchError, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class RpcHelperService {
  private readonly logger = new Logger(RpcHelperService.name);

  constructor(private readonly configService: ConfigService) {}

  async handleAuthResponse<T>(observable: Observable<T>, response?: Response) {
    try {
      const result = await firstValueFrom(
        observable.pipe(
          timeout(5000),
          catchError((err) => {
            this.logger.error(
              `Auth Service communication error: ${err.message}`,
              err.stack,
            );
            if (err instanceof RpcException) {
              const rpcError = err.getError();
              if (
                typeof rpcError === 'object' &&
                rpcError !== null &&
                'status' in rpcError &&
                typeof rpcError['status'] === 'number' &&
                'message' in rpcError
              ) {
                throw new HttpException(
                  rpcError['message'],
                  rpcError['status'],
                );
              }
              throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
            throw new HttpException(
              err.message || 'Auth Service communication error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      if (
        result &&
        typeof result === 'object' &&
        'refreshToken' in result &&
        result.refreshToken &&
        response
      ) {
        response.cookie('jid', result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge:
            this.configService.get('config.auth').refreshTokenExpiresIn * 1000,
        });
        const { refreshToken, ...responseBody } = result;
        return responseBody;
      }
      return result;
    } catch (error) {
      this.logger.error(`Error in handleAuthResponse: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Authentication operation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
