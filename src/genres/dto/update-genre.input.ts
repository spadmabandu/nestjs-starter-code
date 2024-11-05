import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreInput } from './create-genre.input';

export class UpdateGenreInput extends PartialType(CreateGenreInput) {}
