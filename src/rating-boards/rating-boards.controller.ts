import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RatingBoardsService } from './rating-boards.service';
import { CreateRatingBoardInput } from './dto/create-rating-board.input';
import { UpdateRatingBoardInput } from './dto/update-rating-board.input';
import { RatingBoard } from './entities/rating-board.entity';

@Controller('rating-boards')
export class RatingBoardsController {
  constructor(private readonly ratingBoardsService: RatingBoardsService) {}

  @Post()
  create(
    @Body() createRatingBoardInput: CreateRatingBoardInput,
  ): Promise<RatingBoard> {
    return this.ratingBoardsService.create(createRatingBoardInput);
  }

  @Get()
  findAll(): Promise<RatingBoard[]> {
    return this.ratingBoardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RatingBoard | null> {
    return this.ratingBoardsService.findOneById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRatingBoardDto: UpdateRatingBoardInput,
  ): Promise<RatingBoard> {
    return this.ratingBoardsService.update(+id, updateRatingBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.ratingBoardsService.remove(+id);
  }
}
