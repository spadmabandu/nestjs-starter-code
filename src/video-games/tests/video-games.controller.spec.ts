import { Test, TestingModule } from '@nestjs/testing';
import { VideoGamesController } from '../video-games.controller';
import { VideoGamesService } from '../video-games.service';

describe('VideoGamesController', () => {
  let controller: VideoGamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoGamesController],
      providers: [VideoGamesService],
    }).compile();

    controller = module.get<VideoGamesController>(VideoGamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
