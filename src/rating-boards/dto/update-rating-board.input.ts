import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingBoardInput } from './create-rating-board.input';

export class UpdateRatingBoardInput extends PartialType(
  CreateRatingBoardInput,
) {}
