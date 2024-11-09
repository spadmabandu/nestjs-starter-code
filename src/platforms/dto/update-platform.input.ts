import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformInput } from './create-platform.input';

export class UpdatePlatformInput extends PartialType(CreatePlatformInput) {}
