import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './platform.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Platform])],
})
export class PlatformsModule {}
