import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { IUserToken } from './interfaces/user-token.interface';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserProfileOutput } from './dto/user-profile.output';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtTokenService: JwtTokenService,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<IAuthToken> {
    const { email, password, ...rest } = createUserInput;
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    await this.userRepository.save(user);

    const userToken: IUserToken = {
      id: user.id,
      email: user.email,
    };

    return this.jwtTokenService.generateJwtUserToken(userToken);
  }

  async getUserProfile(id: string): Promise<UserProfileOutput> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(User, user);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
