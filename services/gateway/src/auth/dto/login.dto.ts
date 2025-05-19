import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    example: 'user1',
    description: 'User username for login',
    required: true,
  })
  @IsNotEmpty({ message: 'Login username required' })
  readonly username: string;

  @ApiProperty({
    example: 'password123!@#',
    description:
      'User password must be 8 to 16 characters long and contain at least one English letter, at least one number, and at least one special character',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Login password required' })
  readonly password: string;
}
