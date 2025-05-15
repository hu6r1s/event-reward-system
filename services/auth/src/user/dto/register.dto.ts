import { IsIn, IsNotEmpty, Matches } from 'class-validator';
import { Role } from '../schemas/user.schema';

export class RegisterRequest {
  @IsNotEmpty({ message: 'Register username required' })
  readonly username: string;

  @IsNotEmpty({ message: 'Register password required' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,16}$/, {
    message:
      'Password must be 8 to 16 characters long and contain at least one English letter, at least one number, and at least one special character',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'Register nickname required' })
  readonly nickname: string;

  @IsIn(Object.values(Role))
  readonly role: Role;
}
