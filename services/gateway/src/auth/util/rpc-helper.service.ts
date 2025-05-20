import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
            const parsed = JSON.parse(err.message);
            this.logger.error(
              `Auth Service communication error: ${err.message}`,
              err.stack,
            );
            if (parsed instanceof Object) {
              if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'status' in parsed &&
                typeof parsed['status'] === 'number' &&
                'message' in parsed
              ) {
                throw new HttpException(parsed['message'], parsed['status']);
              }
              throw new HttpException(
                parsed.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
            throw new HttpException(
              parsed.message || 'Auth Service communication error',
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
