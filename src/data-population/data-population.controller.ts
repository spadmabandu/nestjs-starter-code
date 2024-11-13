import { Controller, Post } from '@nestjs/common';
import { DataPopulationService } from './data-population.service';

@Controller('data-population')
export class DataPopulationController {
  constructor(private readonly dataPopulationService: DataPopulationService) {}

  @Post('rating-boards')
  populateRatingBoards() {
    return this.dataPopulationService.populateRatingBoards();
  }

  @Post('ratings')
  populateRatings() {
    return this.dataPopulationService.populateRatings();
  }

  @Post('genres')
  populateGenres() {
    return this.dataPopulationService.populateGenres();
  }

  @Post('companies')
  populateCompanies(): Promise<string> {
    return this.dataPopulationService.populateCompanies();
  }

  @Post('platforms')
  populatePlatforms(): Promise<string> {
    return this.dataPopulationService.populatePlatforms();
  }

  @Post('video-games')
  populateVideoGames(): Promise<string> {
    return this.dataPopulationService.populateVideoGames();
  }
}
