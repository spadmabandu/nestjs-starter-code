import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { GIANT_BOMB_API_BASE_URL } from 'config/constants';
import { catchError, lastValueFrom } from 'rxjs';
import { CreateRatingBoardInput } from 'src/rating-boards/dto/create-rating-board.input';
import { RatingBoard } from 'src/rating-boards/entities/rating-board.entity';
import { RatingBoardsService } from 'src/rating-boards/rating-boards.service';
import { ExternalSourceEnum } from 'src/shared/types/types';

@Injectable()
export class DataPopulationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly ratingBoardsService: RatingBoardsService,
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
}
