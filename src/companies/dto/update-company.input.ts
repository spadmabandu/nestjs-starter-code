import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyInput } from './create-company.input';

export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {}
