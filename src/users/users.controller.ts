import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserProfileOutput } from './dto/user-profile.output';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() createUserInput: CreateUserInput): Promise<IAuthToken> {
    return this.usersService.create(createUserInput);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserProfileOutput> {
    const user = req.user;
    return this.usersService.getUserProfile(user.id);
  }
}
