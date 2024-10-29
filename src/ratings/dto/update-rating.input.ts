import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingInput } from './create-rating.input';

export class UpdateRatingInput extends PartialType(CreateRatingInput) {}
