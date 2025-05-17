export class LoginStreakDto {
  streakLogins: number;
  lastLoginDate: Date;
}

export class LoginStreakResponse {
  username: string;
  streakLogins: number;
  lastLoginDate: Date;
}