import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { mockAuthToken } from './mock-data';
import { mockUser } from 'src/users/tests/mock-data';
import { IUserToken } from 'src/users/interfaces/user-token.interface';

/** Unit tests for AuthController */
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call the login method from AuthService and return an auth token', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthToken);
      const userToken: IUserToken = {
        id: mockUser.id,
        email: mockUser.email,
      };
      const req = { user: userToken };
      const result = await authController.login(req as any);

      expect(authService.login).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual(mockAuthToken);
    });
  });
});
