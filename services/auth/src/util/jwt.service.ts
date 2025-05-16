import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { TokenPayload } from 'src/auth/auth.service';

@Injectable()
export class TokenService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const authConfig = this.configService.get('config.auth');
    return await this.jwtService.signAsync(payload, {
      secret: authConfig.jwtSecret,
      expiresIn: authConfig.accessTokenExpiresIn,
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const authConfig = this.configService.get('config.auth');
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: authConfig.jwtRefreshSecret,
      expiresIn: authConfig.refreshTokenExpiresIn,
    });

    await this.cacheManager.set(
      payload.sub,
      refreshToken,
      authConfig.refreshTokenExpiresIn,
    );

    return refreshToken;
  }
}
