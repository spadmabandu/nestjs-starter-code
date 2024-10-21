import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { IUserToken } from 'src/users/interfaces/user-token.interface';
import { IAuthToken } from './interfaces/auth-token.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request): Promise<IAuthToken> {
    const userToken = req.user as IUserToken;
    return this.authService.login(userToken);
  }
}
