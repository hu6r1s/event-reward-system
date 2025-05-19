import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { LoginRequest } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';
import { RpcHelperService } from './util/rpc-helper.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly rpcHelper: RpcHelperService,
  ) {}

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
    return this.rpcHelper.handleAuthResponse(observable, response);
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
    return this.rpcHelper.handleAuthResponse(observable, response);
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
    return this.rpcHelper.handleAuthResponse(observable, response);
  }
}
