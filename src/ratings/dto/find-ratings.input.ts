import { PartialType } from '@nestjs/mapped-types';
import { Rating } from '../entities/rating.entity';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class FindRatingsInput extends PartialType(Rating) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ids?: number[];
}
