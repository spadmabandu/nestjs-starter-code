import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { mockUser } from './mock-data';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '../user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { mockAuthToken } from 'src/auth/tests/mock-data';

/** Unit tests for UsersController */
describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAuthToken),
            getUserProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('signup', () => {
    it('should call the create method from UsersService and return an auth token', async () => {
      const { id, isActive, ...createUserInput } = mockUser;
      const result = await usersController.signup(createUserInput);

      expect(usersService.create).toHaveBeenCalledWith(createUserInput);
      expect(result).toEqual(mockAuthToken);
    });
  });

  describe('getProfile', () => {
    it(`should return a user's profile details without a password`, async () => {
      const userProfile = plainToInstance(User, mockUser);
      jest.spyOn(usersService, 'getUserProfile').mockResolvedValue(userProfile);

      const req = { user: { id: userProfile.id } };
      const result = await usersController.getProfile(req as any);

      expect(usersService.getUserProfile).toHaveBeenCalledWith(userProfile.id);
      expect(result).toEqual(userProfile);
    });

    it(`should throw a NotFoundException if no user is found`, async () => {
      jest
        .spyOn(usersService, 'getUserProfile')
        .mockRejectedValue(new NotFoundException('User not found'));

      const req = { user: { id: 'invalid-user-id' } };
      await expect(usersController.getProfile(req as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.getUserProfile).toHaveBeenCalledWith(
        'invalid-user-id',
      );
    });
  });
});
