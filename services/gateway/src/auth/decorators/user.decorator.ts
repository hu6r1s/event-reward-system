import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: string;
}

export const User = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser; 
    return data ? user?.[data] : user;
  },
);
