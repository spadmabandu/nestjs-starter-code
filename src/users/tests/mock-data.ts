import { User } from '../entities/user.entity';

export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  password: 'hashedPassword',
  firstName: 'Test First Name',
  lastName: 'Test Last Name',
  isActive: true,
};
