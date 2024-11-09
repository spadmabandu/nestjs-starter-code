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

export class CreatePlatformInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

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
