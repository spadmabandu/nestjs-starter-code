import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoGame } from './video-game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoGame])],
})
export class VideoGamesModule {}
