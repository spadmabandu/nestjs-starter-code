import { Test, TestingModule } from '@nestjs/testing';
import { RatingBoardsController } from '../rating-boards.controller';
import { RatingBoardsService } from '../rating-boards.service';

describe('RatingBoardsController', () => {
  let controller: RatingBoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingBoardsController],
      providers: [RatingBoardsService],
    }).compile();

    controller = module.get<RatingBoardsController>(RatingBoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
