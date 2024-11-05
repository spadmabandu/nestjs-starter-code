import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { GIANT_BOMB_API_BASE_URL } from 'config/constants';
import { catchError, lastValueFrom } from 'rxjs';
import { CreateGenreInput } from 'src/genres/dto/create-genre.input';
import { GenresService } from 'src/genres/genres.service';
import { CreateRatingBoardInput } from 'src/rating-boards/dto/create-rating-board.input';
import { RatingBoard } from 'src/rating-boards/entities/rating-board.entity';
import { RatingBoardsService } from 'src/rating-boards/rating-boards.service';
import { CreateRatingInput } from 'src/ratings/dto/create-rating.input';
import { Rating } from 'src/ratings/entities/rating.entity';
import { RatingsService } from 'src/ratings/ratings.service';
import { ExternalSourceEnum } from 'src/shared/types/types';

@Injectable()
export class DataPopulationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly genresService: GenresService,
    private readonly ratingBoardsService: RatingBoardsService,
    private readonly ratingsService: RatingsService,
  ) {}

  async populateRatingBoards(): Promise<RatingBoard[]> {
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/rating_boards/?api_key=${apiKey}&format=json`;

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url),
      );
      const createManyRatingBoardsInput: CreateRatingBoardInput[] =
        response.data.results.map((ratingBoard: any) => {
          const {
            id,
            guid,
            name,
            description = null,
            deck = null,
            image: { original_url = null } = {},
          } = ratingBoard;
          const createRatingBoardInput: CreateRatingBoardInput = {
            name,
            description,
            summary: deck,
            mainImage: original_url,
            externalId: id,
            guid,
            externalSource: ExternalSourceEnum.GIANT_BOMB,
          };
          return createRatingBoardInput;
        });

      return await this.ratingBoardsService.createMany(
        createManyRatingBoardsInput,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async populateRatings() {
    const ratingBoards = await this.ratingBoardsService.findAll();
    const ratingBoardMap = new Map<number, number>();

    // Create a hash map of the rating board's external id to its database id
    ratingBoards.forEach((ratingBoard) => {
      if (ratingBoard.externalId) {
        ratingBoardMap.set(ratingBoard.externalId, ratingBoard.id);
      }
    });

    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/game_ratings?format=json&api_key=${apiKey}`;

    try {
      // Fetch rating data from Giant Bomb API
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url),
      );

      // Transform API response into createMany input format
      const createManyRatingsInput: CreateRatingInput[] =
        response.data.results.map((rating: any) => {
          const {
            id,
            guid,
            name,
            image = null,
            rating_board: { id: external_rating_board_id },
          } = rating;

          // Map Rating Board external id to its id in the internal database
          const internalRatingBoardId = ratingBoardMap.get(
            external_rating_board_id,
          );
          if (!internalRatingBoardId) {
            throw new NotFoundException(
              `Rating Board with id: ${external_rating_board_id} not found`,
            );
          }

          const createRatingInput: CreateRatingInput = {
            name,
            externalId: id,
            guid,
            mainImage: image,
            externalSource: ExternalSourceEnum.GIANT_BOMB,
            ratingBoardId: internalRatingBoardId,
          };
          return createRatingInput;
        });

      return await this.ratingsService.createMany(createManyRatingsInput);
    } catch (error) {
      throw new Error(error);
    }
  }

  async populateGenres() {
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/genres?format=json&api_key=${apiKey}`;

    // Fetch genres data from Giant Bomb API
    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url),
      );

      // Transform API response into createMany input format
      const createManyGenresInput: CreateGenreInput[] =
        response.data.results.map((genre: any) => {
          const {
            id,
            guid,
            name,
            description = null,
            deck = null,
            image: { original_url = null } = {},
          } = genre;
          const createGenreInput: CreateGenreInput = {
            name,
            description,
            summary: deck,
            mainImage: original_url,
            externalId: id,
            guid,
            externalSource: ExternalSourceEnum.GIANT_BOMB,
          };
          return createGenreInput;
        });

      return await this.genresService.createMany(createManyGenresInput);
    } catch (e) {
      throw new Error(e);
    }
  }
}
