import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VideoGamesService } from './video-games.service';
import { CreateVideoGameInput } from './dto/create-video-game.input';
import { UpdateVideoGameInput } from './dto/update-video-game.input';
import { VideoGame } from './entities/video-game.entity';

@Controller('video-games')
export class VideoGamesController {
  constructor(private readonly videoGamesService: VideoGamesService) {}

  @Post()
  create(
    @Body() createVideoGameInput: CreateVideoGameInput,
  ): Promise<VideoGame> {
    return this.videoGamesService.create(createVideoGameInput);
  }

  @Get()
  findAll() {
    return this.videoGamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoGamesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVideoGameInput: UpdateVideoGameInput,
  ) {
    return this.videoGamesService.update(+id, updateVideoGameInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoGamesService.remove(+id);
  }
}
