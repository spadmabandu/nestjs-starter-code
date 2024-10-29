import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { RatingBoardsModule } from 'src/rating-boards/rating-boards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rating]), RatingBoardsModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
