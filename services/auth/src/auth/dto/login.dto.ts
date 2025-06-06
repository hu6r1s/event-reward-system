import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'Login username required' })
  readonly username: string;

  @IsNotEmpty({ message: 'Login password required' })
  readonly password: string;
}

export class LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}
