import { PartialType } from '@nestjs/mapped-types';
import { Platform } from '../entities/platform.entity';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class FindPlatformsInput extends PartialType(Platform) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ids?: number[];
}
