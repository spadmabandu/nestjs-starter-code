import { Module } from '@nestjs/common';
import { VideoGamesService } from './video-games.service';
import { VideoGamesController } from './video-games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoGame } from './entities/video-game.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { GenresModule } from 'src/genres/genres.module';
import { PlatformsModule } from 'src/platforms/platforms.module';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoGame]),
    CompaniesModule,
    GenresModule,
    PlatformsModule,
    RatingsModule,
  ],
  controllers: [VideoGamesController],
  providers: [VideoGamesService],
  exports: [VideoGamesService],
})
export class VideoGamesModule {}
