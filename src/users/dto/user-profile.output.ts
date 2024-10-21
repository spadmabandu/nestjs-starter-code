import { OmitType } from '@nestjs/mapped-types';
import { User } from '../user.entity';

export class UserProfileOutput extends OmitType(User, ['password'] as const) {}
