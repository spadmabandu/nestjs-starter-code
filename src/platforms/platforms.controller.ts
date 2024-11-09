import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformInput } from './dto/create-platform.input';
import { UpdatePlatformInput } from './dto/update-platform.input';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post()
  create(@Body() createPlatformInput: CreatePlatformInput) {
    return this.platformsService.create(createPlatformInput);
  }

  @Get()
  findAll() {
    return this.platformsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlatformInput: UpdatePlatformInput,
  ) {
    return this.platformsService.update(+id, updatePlatformInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformsService.remove(+id);
  }
}
