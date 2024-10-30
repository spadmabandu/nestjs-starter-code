import { Controller, Post } from '@nestjs/common';
import { DataPopulationService } from './data-population.service';

@Controller('data-population')
export class DataPopulationController {
  constructor(private readonly dataPopulationService: DataPopulationService) {}

  @Post('rating-boards')
  populateRatingBoards() {
    return this.dataPopulationService.populateRatingBoards();
  }
}