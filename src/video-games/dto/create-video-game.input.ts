import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExternalSourceEnum } from 'src/shared/types/types';

export class CreateVideoGameInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[] | null;

  @IsOptional()
  @IsDate()
  releaseDate?: Date | null;

  @IsOptional()
  @IsNumber()
  expectedReleaseYear?: number | null;

  @IsOptional()
  @IsNumber()
  expectedReleaseQuarter?: number | null;

  @IsOptional()
  @IsNumber()
  expectedReleaseMonth?: number | null;

  @IsOptional()
  @IsNumber()
  expectedReleaseDay?: number | null;

  @IsOptional()
  @IsString()
  mainImage?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] | null;

  @IsOptional()
  @IsNumber()
  externalId?: number | null;

  @IsOptional()
  @IsString()
  guid?: string | null;

  @IsOptional()
  @IsEnum(ExternalSourceEnum)
  externalSource?: ExternalSourceEnum | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds?: number[] | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  platformIds?: number[] | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  developerIds?: number[] | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  publisherIds?: number[] | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ratingIds?: number[] | null;
}
