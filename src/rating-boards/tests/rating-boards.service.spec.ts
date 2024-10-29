import { Test, TestingModule } from '@nestjs/testing';
import { RatingBoardsService } from '../rating-boards.service';

describe('RatingBoardsService', () => {
  let service: RatingBoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingBoardsService],
    }).compile();

    service = module.get<RatingBoardsService>(RatingBoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
