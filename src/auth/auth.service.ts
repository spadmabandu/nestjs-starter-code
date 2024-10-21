import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IUserToken } from 'src/users/interfaces/user-token.interface';
import { IAuthToken } from './interfaces/auth-token.interface';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtTokenService: JwtTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<IUserToken> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const userToken: IUserToken = {
      id: user.id,
      email: user.email,
    };

    return userToken;
  }

  async login(userToken: IUserToken): Promise<IAuthToken> {
    return this.jwtTokenService.generateJwtUserToken(userToken);
  }
}
