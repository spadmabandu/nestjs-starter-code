import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { IUserToken } from 'src/users/interfaces/user-token.interface';

@Injectable()
export class JwtTokenService {
  constructor(private jwtService: JwtService) {}

  async generateJwtUserToken(userToken: IUserToken): Promise<IAuthToken> {
    const { email, id } = userToken;
    const payload = { sub: id, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
