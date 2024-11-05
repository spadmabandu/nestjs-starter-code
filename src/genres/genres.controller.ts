import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreInput } from './dto/create-genre.input';
import { UpdateGenreInput } from './dto/update-genre.input';
import { Genre } from './entities/genre.entity';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  create(@Body() createGenreInput: CreateGenreInput): Promise<Genre> {
    return this.genresService.create(createGenreInput);
  }

  @Get()
  findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Genre | null> {
    return this.genresService.findOneById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGenreInput: UpdateGenreInput) {
    return this.genresService.update(+id, updateGenreInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genresService.remove(+id);
  }
}
