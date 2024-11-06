import { Module } from '@nestjs/common';
import { DataPopulationController } from './data-population.controller';
import { DataPopulationService } from './data-population.service';
import { HttpModule } from '@nestjs/axios';
import { RatingBoardsModule } from 'src/rating-boards/rating-boards.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { GenresModule } from 'src/genres/genres.module';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    HttpModule,
    RatingBoardsModule,
    RatingsModule,
    GenresModule,
    CompaniesModule,
  ],
  controllers: [DataPopulationController],
  providers: [DataPopulationService],
})
export class DataPopulationModule {}
