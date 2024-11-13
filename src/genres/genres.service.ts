import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreInput } from './dto/create-genre.input';
import { UpdateGenreInput } from './dto/update-genre.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { FindGenresInput } from './dto/find-genres.input';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreInput: CreateGenreInput): Promise<Genre> {
    const existingGenre = await this.findOneByName(createGenreInput.name);
    if (existingGenre) {
      throw new ConflictException('Genre already exists');
    }

    const genre = this.genreRepository.create(createGenreInput);

    try {
      return await this.genreRepository.save(genre);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async createMany(
    createManyGenresInput: CreateGenreInput[],
  ): Promise<Genre[]> {
    // De-duplicate genres that already exist
    const existingGenres = await this.genreRepository.find({
      select: ['name'],
    });
    const existingGenresSet = new Set(
      existingGenres.map((genre) => genre.name),
    );

    const newGenres = createManyGenresInput.filter(
      (input) => !existingGenresSet.has(input.name),
    );
    if (newGenres.length === 0) {
      return [];
    }

    const genres = newGenres.map((input) => this.genreRepository.create(input));

    try {
      return this.genreRepository.save(genres);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  findByIds(ids: number[]): Promise<Genre[]> {
    return this.genreRepository.find({
      where: { id: In(ids) },
    });
  }

  async findOneById(id: number): Promise<Genre | null> {
    return this.genreRepository.findOneBy({ id });
  }

  async findOneByName(name: string): Promise<Genre | null> {
    return this.genreRepository.findOneBy({ name });
  }

  findManyBy(findGenresInput: FindGenresInput): Promise<Genre[]> {
    const { ids } = findGenresInput;

    const where: FindOptionsWhere<Genre> = {};

    if (ids) {
      where.id = In(ids);
    }

    return this.genreRepository.find({ where });
  }

  findFieldsBy<T extends keyof Genre>(
    fields: T[],
    where?: Partial<Record<keyof Genre, any>>,
  ): Promise<Pick<Genre, T>[]> {
    return this.genreRepository.find({
      select: fields,
      where,
    });
  }

  async update(id: number, updateGenreInput: UpdateGenreInput): Promise<Genre> {
    const genre = await this.findOneById(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    Object.assign(genre, updateGenreInput);

    try {
      return await this.genreRepository.save(genre);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findOneById(id);
    if (!genre) {
      throw new NotFoundException(`Genre not found`);
    }

    try {
      await this.genreRepository.remove(genre);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
