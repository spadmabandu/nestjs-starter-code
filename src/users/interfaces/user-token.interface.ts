import { User } from '../user.entity';

export type IUserToken = Pick<User, 'email' | 'id'>;
