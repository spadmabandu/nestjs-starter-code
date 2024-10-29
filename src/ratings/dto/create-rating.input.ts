import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExternalSourceEnum } from 'src/shared/types/types';

export class CreateRatingInput {
  @IsNotEmpty()
  @IsNumber()
  ratingBoardId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

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
