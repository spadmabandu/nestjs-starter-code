import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingBoard } from './rating-board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RatingBoard])],
})
export class RatingBoardsModule {}
