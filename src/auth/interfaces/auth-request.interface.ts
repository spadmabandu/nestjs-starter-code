import { Request } from 'express';
import { IUserToken } from 'src/users/interfaces/user-token.interface';

export interface AuthenticatedRequest extends Request {
  user: IUserToken;
}
