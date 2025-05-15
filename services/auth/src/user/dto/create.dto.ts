import { Role } from '../schemas/user.schema';

export class CreateUser {
  username: string;
  password: string;
  nickname: string;
  role: Role;
}
