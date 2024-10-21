import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { mockUser } from './mock-data';
import { ConflictException } from '@nestjs/common';
import { mockAuthToken } from 'src/auth/tests/mock-data';

/** Unit tests for UsersService */
describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let jwtTokenService: JwtTokenService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
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

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    jwtTokenService = moduleRef.get<JwtTokenService>(JwtTokenService);
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(mockUser);
      const result = await usersService.findOneById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });

    it('should return null if user not found', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);
      const result = await usersService.findOneById(mockUser.id);

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(mockUser);
      const result = await usersService.findOneByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it('should return null if user not found', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);
      const result = await usersService.findOneByEmail(mockUser.email);

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });

  describe('create', () => {
    it('should create a new user and return a jwt token', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      userRepository.create = jest.fn().mockReturnValue(mockUser);
      userRepository.save = jest.fn().mockReturnValue(mockUser);

      const { id, isActive, ...createUserInput } = mockUser;
      const result = await usersService.create(createUserInput);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        createUserInput.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserInput,
        password: expect.any(String),
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: expect.any(String),
      });
      expect(jwtTokenService.generateJwtUserToken).toHaveBeenCalledWith({
        id,
        email: mockUser.email,
      });
      expect(result).toEqual(mockAuthToken);
    });

    it('should throw a ConflictException if email is already in use', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);

      const { id, isActive, ...createUserInput } = mockUser;

      await expect(usersService.create(createUserInput)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        createUserInput.email,
      );
    });
  });
});
