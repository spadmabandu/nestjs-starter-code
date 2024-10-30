import { Module } from '@nestjs/common';
import { DataPopulationController } from './data-population.controller';
import { DataPopulationService } from './data-population.service';
import { HttpModule } from '@nestjs/axios';
import { RatingBoardsModule } from 'src/rating-boards/rating-boards.module';

@Module({
  imports: [HttpModule, RatingBoardsModule],
  controllers: [DataPopulationController],
  providers: [DataPopulationService],
})
export class DataPopulationModule {}
