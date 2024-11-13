import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoGameInput } from './dto/create-video-game.input';
import { UpdateVideoGameInput } from './dto/update-video-game.input';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoGame } from './entities/video-game.entity';
import { Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { GenresService } from 'src/genres/genres.service';
import { PlatformsService } from 'src/platforms/platforms.service';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class VideoGamesService {
  constructor(
    @InjectRepository(VideoGame)
    private videoGameRepository: Repository<VideoGame>,
    private companiesService: CompaniesService,
    private genresService: GenresService,
    private platformsService: PlatformsService,
    private ratingsService: RatingsService,
  ) {}

  async create(createVideoGameInput: CreateVideoGameInput) {
    const {
      genreIds,
      platformIds,
      developerIds,
      publisherIds,
      ratingIds,
      ...newVideoGame
    } = createVideoGameInput;

    // Fetch all related entities
    const [developers, publishers, genres, platforms, ratings] =
      await Promise.all([
        developerIds
          ? this.companiesService.findManyBy({ ids: developerIds })
          : Promise.resolve(null),
        publisherIds
          ? this.companiesService.findManyBy({ ids: publisherIds })
          : Promise.resolve(null),
        genreIds ? this.genresService.findManyBy({ ids: genreIds }) : null,
        platformIds
          ? this.platformsService.findManyBy({
              ids: platformIds,
            })
          : Promise.resolve(null),
        ratingIds
          ? this.ratingsService.findManyBy({
              ids: ratingIds,
            })
          : Promise.resolve(null),
      ]);

    // Create new Video Game entity
    const videoGame = this.videoGameRepository.create({
      ...newVideoGame,
      genres,
      platforms,
      ratings,
      developers,
      publishers,
    });

    try {
      return await this.videoGameRepository.save(videoGame);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to create Video Game`);
    }
  }

  findAll(): Promise<VideoGame[]> {
    return this.videoGameRepository.find();
  }

  async findOne(id: number): Promise<VideoGame> {
    const videoGame = await this.videoGameRepository.findOne({
      where: { id },
      relations: ['genres', 'platforms', 'developers', 'publishers', 'ratings'],
    });

    if (!videoGame) {
      throw new NotFoundException(`Video Game not found`);
    }

    return videoGame;
  }

  findOneById(id: number): Promise<VideoGame | null> {
    return this.videoGameRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateVideoGameInput: UpdateVideoGameInput,
  ): Promise<VideoGame> {
    const videoGame = await this.findOneById(id);
    if (!videoGame) {
      throw new NotFoundException(`Video Game not found`);
    }

    Object.assign(videoGame, updateVideoGameInput);

    try {
      return await this.videoGameRepository.save(videoGame);
    } catch (e) {
      throw new InternalServerErrorException(`Error updating Video Game`);
    }
  }

  async remove(id: number): Promise<void> {
    const videoGame = await this.findOneById(id);
    if (!videoGame) {
      throw new NotFoundException(`Video Game not found`);
    }

    try {
      await this.videoGameRepository.remove(videoGame);
    } catch (e) {
      throw new InternalServerErrorException(`Error removing Video Game`);
    }
  }
}
