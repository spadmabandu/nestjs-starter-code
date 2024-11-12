import { PartialType } from '@nestjs/mapped-types';
import { Genre } from '../entities/genre.entity';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class FindGenresInput extends PartialType(Genre) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ids?: number[];
}
