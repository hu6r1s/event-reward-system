import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, Matches } from 'class-validator';

export enum Role {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

export class RegisterRequest {
  @ApiProperty({
    example: 'user1',
    description: 'User username for register',
    required: true,
  })
  @IsNotEmpty({ message: 'Register username required' })
  readonly username: string;

  @ApiProperty({
    example: 'asd123!@#',
    description:
      'User password must be 8 to 16 characters long and contain at least one English letter, at least one number, and at least one special character',
    required: true,
  })
  @IsNotEmpty({ message: 'Register password required' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,16}$/, {
    message:
      'Password must be 8 to 16 characters long and contain at least one English letter, at least one number, and at least one special character',
  })
  readonly password: string;

  @ApiProperty({
    example: 'user1',
    description: 'User nickname for register',
    required: true,
  })
  @IsNotEmpty({ message: 'Register nickname required' })
  readonly nickname: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role for register',
    required: true,
  })
  @IsIn(Object.values(Role))
  readonly role: Role;
}
