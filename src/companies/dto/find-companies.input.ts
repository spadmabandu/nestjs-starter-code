import { PartialType } from '@nestjs/mapped-types';
import { Company } from '../entities/company.entity';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class FindCompaniesInput extends PartialType(Company) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ids?: number[];
}
