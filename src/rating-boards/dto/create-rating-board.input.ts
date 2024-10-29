import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExternalSourceEnum } from 'src/shared/types/types';

export class CreateRatingBoardInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  @IsNumber()
  externalId?: number;

  @IsOptional()
  @IsString()
  guid?: string;

  @IsOptional()
  @IsEnum(ExternalSourceEnum)
  externalSource?: ExternalSourceEnum;
}
