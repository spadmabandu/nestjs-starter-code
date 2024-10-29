import { Module } from '@nestjs/common';
import { RatingBoardsService } from './rating-boards.service';
import { RatingBoardsController } from './rating-boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingBoard } from './entities/rating-board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RatingBoard])],
  controllers: [RatingBoardsController],
  providers: [RatingBoardsService],
  exports: [RatingBoardsService],
})
export class RatingBoardsModule {}
