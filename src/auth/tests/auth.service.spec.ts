import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { mockAuthToken } from './mock-data';
import { mockUser } from 'src/users/tests/mock-data';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { IUserToken } from 'src/users/interfaces/user-token.interface';

/** Unit tests for AuthService */
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtTokenService: JwtTokenService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtTokenService,
          useValue: {
            generateJwtUserToken: jest.fn().mockResolvedValue(mockAuthToken),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtTokenService = moduleRef.get<JwtTokenService>(JwtTokenService);
  });

  describe('validateUser', () => {
    it('should return a user token if user credentials are valid', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser(
        mockUser.email,
        'plainTextPassword',
      );

      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainTextPassword',
        mockUser.password,
      );
    });

    it('should throw an UnauthorizedException if the user is not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(
        authService.validateUser(mockUser.email, 'plainTextPassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should throw an UnauthorizedException if the password does not match', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        authService.validateUser(mockUser.email, 'plainTextPassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
    });
  });

  describe('login', () => {
    it('should return a jwt token', async () => {
      const userToken: IUserToken = {
        id: mockUser.id,
        email: mockUser.email,
      };
      const result = await authService.login(userToken);

      expect(result).toEqual(mockAuthToken);
      expect(jwtTokenService.generateJwtUserToken).toHaveBeenCalledWith(
        userToken,
      );
    });
  });
});
