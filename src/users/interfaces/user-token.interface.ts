import { User } from '../entities/user.entity';

export type IUserToken = Pick<User, 'email' | 'id'>;
