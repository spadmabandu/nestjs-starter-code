import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoGameInput } from './create-video-game.input';

export class UpdateVideoGameInput extends PartialType(CreateVideoGameInput) {}
