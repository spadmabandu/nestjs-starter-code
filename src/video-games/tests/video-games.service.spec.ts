import { Test, TestingModule } from '@nestjs/testing';
import { VideoGamesService } from '../video-games.service';

describe('VideoGamesService', () => {
  let service: VideoGamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoGamesService],
    }).compile();

    service = module.get<VideoGamesService>(VideoGamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
