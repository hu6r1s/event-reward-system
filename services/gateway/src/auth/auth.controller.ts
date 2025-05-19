import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { LoginRequest } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  private async handleAuthResponse(observable: any, response?: Response) {
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

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiBody({ type: RegisterRequest })
  @ApiCreatedResponse({
    description: 'User successfully registered',
  })
  @ApiConflictResponse({ description: 'username already exists' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const observable = this.authClient.send({ cmd: 'register_user' }, request);
    return this.handleAuthResponse(observable, response);
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Logs in an existing user and returns an access token',
  })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({
    description:
      'Login successful, accessToken returned. Refresh token set in HTTPOnly cookie',
    type: Response,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const observable = this.authClient.send({ cmd: 'login_user' }, request);
    return this.handleAuthResponse(observable, response);
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a refresh token from cookie',
  })
  @ApiCookieAuth('refreshTokenCookie')
  @ApiOkResponse({
    description: 'Access token refreshed successfully',
    type: Response,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['jid'];
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    const observable = this.authClient.send(
      { cmd: 'user_token_refresh' },
      refreshToken,
    );
    return this.handleAuthResponse(observable, response);
  }

  @Get(':_id')
  async getUserInfo(
    @Param('_id') _id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const observable = this.authClient.send({ cmd: 'user_info' }, _id);
    return this.handleAuthResponse(observable, response);
  }
}
