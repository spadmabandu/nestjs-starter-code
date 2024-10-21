import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { JwtTokenModule } from 'src/jwt-token/jwt-token.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtTokenModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
