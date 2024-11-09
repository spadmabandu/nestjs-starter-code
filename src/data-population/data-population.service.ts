import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { GIANT_BOMB_API_BASE_URL } from 'config/constants';
import { lastValueFrom } from 'rxjs';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateCompanyInput } from 'src/companies/dto/create-company.input';
import { CreateGenreInput } from 'src/genres/dto/create-genre.input';
import { GenresService } from 'src/genres/genres.service';
import { CreatePlatformInput } from 'src/platforms/dto/create-platform.input';
import { PlatformsService } from 'src/platforms/platforms.service';
import { CreateRatingBoardInput } from 'src/rating-boards/dto/create-rating-board.input';
import { RatingBoard } from 'src/rating-boards/entities/rating-board.entity';
import { RatingBoardsService } from 'src/rating-boards/rating-boards.service';
import { CreateRatingInput } from 'src/ratings/dto/create-rating.input';
import { RatingsService } from 'src/ratings/ratings.service';
import { ExternalSourceEnum } from 'src/shared/types/types';
import { Not } from 'typeorm';

@Injectable()
export class DataPopulationService {
  private readonly BATCH_SIZE = 100;
  private readonly DELAY_BETWEEN_REQUESTS_MS = 2 * 60 * 1000; // 2 minute delay

  constructor(
    private readonly httpService: HttpService,
    private readonly companiesService: CompaniesService,
    private readonly configService: ConfigService,
    private readonly genresService: GenresService,
    private readonly platformsService: PlatformsService,
    private readonly ratingBoardsService: RatingBoardsService,
    private readonly ratingsService: RatingsService,
  ) {}

  async populateRatingBoards(): Promise<RatingBoard[]> {
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/rating_boards`;

    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url, {
          params: {
            api_key: apiKey,
            format: 'json',
          },
        }),
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

    // Create a hash map of the rating board's external id to its internal database id
    ratingBoards.forEach((ratingBoard) => {
      if (ratingBoard.externalId) {
        ratingBoardMap.set(ratingBoard.externalId, ratingBoard.id);
      }
    });

    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/game_ratings`;

    try {
      // Fetch rating data from Giant Bomb API
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url, {
          params: {
            api_key: apiKey,
            format: 'json',
          },
        }),
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
    const url = `${GIANT_BOMB_API_BASE_URL}/genres`;

    // Fetch genres data from Giant Bomb API
    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url, {
          params: {
            api_key: apiKey,
            format: 'json',
          },
        }),
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

  async populateCompanies(): Promise<string> {
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/companies`;

    let totalToFetch: number = 0;
    let totalFetched: number = 0;
    let page: number = 1;

    while (totalFetched === 0 || totalFetched < totalToFetch) {
      try {
        const response: AxiosResponse = await this.fetchDataWithRetries(url, {
          api_key: apiKey,
          format: 'json',
          offset: (page - 1) * this.BATCH_SIZE,
          limit: this.BATCH_SIZE,
        });

        const { number_of_page_results, number_of_total_results, results } =
          response.data;

        // Update number of results fetched
        totalFetched += number_of_page_results;
        totalToFetch = number_of_total_results;
        page += 1;

        // Transform API response into createMany input format
        const createManyCompaniesInput: CreateCompanyInput[] = results.map(
          (company: any) => {
            const {
              id,
              guid,
              name,
              website = null,
              date_founded = null,
              location_address = null,
              location_city = null,
              location_country = null,
              location_state = null,
              image: { original_url = null } = {},
              abbreviation = null,
              aliases = null,
              deck = null,
              description = null,
            } = company;

            // Separate aliases from Giant Bomb API into string array
            const aliasesArray: string[] = aliases
              ? aliases.split(/\r?\n/)
              : null;

            const createCompanyInput: CreateCompanyInput = {
              name,
              description,
              summary: deck,
              mainImage: original_url,
              externalId: id,
              guid,
              externalSource: ExternalSourceEnum.GIANT_BOMB,
              website,
              dateFounded: date_founded,
              abbreviation,
              aliases: aliasesArray,
              streetAddress: location_address,
              city: location_city,
              state: location_state,
              country: location_country,
            };

            return createCompanyInput;
          },
        );

        await this.companiesService.createMany(createManyCompaniesInput);

        console.log(
          `Processed page ${page - 1} of companies. Total fetched: ${totalFetched}`,
        );

        // Inject delay to avoid hitting API rate limits
        await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
      } catch (e) {
        console.error(
          `Error fetching page ${page}. Processed ${totalFetched} of ${totalToFetch} companies.`,
          e,
        );
        throw new Error(e);
      }
    }

    return `Retrieved and processed ${totalFetched} of ${totalToFetch} companies`;
  }

  async populatePlatforms(): Promise<string> {
    // Fetch companies to associate with each platform
    const companies = await this.companiesService.findFieldsBy(
      ['id', 'externalId'],
      { externalSource: ExternalSourceEnum.GIANT_BOMB },
    );

    const companyMap = new Map<number, number>();

    // Create a map of the company's external id to its internal database id
    companies.forEach((company) => {
      if (company.externalId) {
        companyMap.set(company.externalId, company.id);
      }
    });

    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const url = `${GIANT_BOMB_API_BASE_URL}/platforms`;

    let totalToFetch: number = 0;
    let totalFetched: number = 0;
    let totalSaved: number = 0;
    let page: number = 1;

    while (totalFetched === 0 || totalFetched < totalToFetch) {
      try {
        // Fetch platform data from Giant Bomb API
        const response: AxiosResponse = await this.fetchDataWithRetries(url, {
          api_key: apiKey,
          format: 'json',
          offset: (page - 1) * this.BATCH_SIZE,
          limit: this.BATCH_SIZE,
        });

        const { number_of_page_results, number_of_total_results, results } =
          response.data;

        // Update number of results fetched
        totalFetched += number_of_page_results;
        totalToFetch = number_of_total_results;
        page += 1;

        // Transform API response into createMany input format
        const createManyPlatformsInput: CreatePlatformInput[] = results
          .map((platform: any) => {
            const {
              id,
              guid,
              name,
              aliases = null,
              abbreviation = null,
              deck = null,
              description = null,
              image: { original_url = null } = {},
              release_date = null,
              company = {},
            } = platform || {};

            const external_company_id = company?.id ?? null;

            if (!external_company_id) {
              return undefined;
            }

            // Map Company external id to its internal database id
            const internalCompanyId = companyMap.get(external_company_id);

            // TODO - for now, skip creating a Platform if the associated company
            // does not exist in the internal database.
            // Come back later to throw an error instead, after all companies have been populated in the internal database.
            if (!internalCompanyId) {
              return undefined;
            }

            // Separate aliases from API into string array
            const aliasesArray: string[] = aliases
              ? aliases.split(/\r?\n/)
              : null;

            const createPlatformInput: CreatePlatformInput = {
              name,
              description,
              summary: deck,
              mainImage: original_url,
              externalId: id,
              guid,
              externalSource: ExternalSourceEnum.GIANT_BOMB,
              releaseDate: release_date,
              abbreviation,
              aliases: aliasesArray,
              companyId: internalCompanyId,
            };

            return createPlatformInput;
          })
          .filter(
            (input: CreateCompanyInput | undefined) => input !== undefined,
          );

        await this.platformsService.createMany(createManyPlatformsInput);

        // Update the count of platforms actually saved (not skipped)
        totalSaved += createManyPlatformsInput.length;

        console.log(
          `Processed page ${page - 1} of platforms. Total fetched: ${totalFetched}. Total saved: ${totalSaved}.`,
        );

        // Inject delay to avoid hitting API rate limits
        await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
      } catch (error) {
        console.error(
          `Error fetching page ${page}. Fetched ${totalFetched} of ${totalToFetch} platforms. Total saved: ${totalSaved}.`,
          error,
        );
        throw new Error(error);
      }
    }

    return `Retrieved and processed ${totalFetched} of ${totalToFetch} platforms. Total Platforms saved: ${totalSaved}`;
  }

  /**
   * Helper function to artifically create a delay to avoid hitting 3rd party API rate limits
   * @param ms delay time in milliseconds
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Function to fetch data from an external API with retries, so 1 failure does
   * not terminate the entire operation.
   * @param {string} url
   * @param {object} params
   * @param {number} retries
   * @returns {Promise<AxiosResponse<any, any>>}
   */
  async fetchDataWithRetries(
    url: string,
    params: object,
    retries: number = 3,
  ): Promise<AxiosResponse<any, any>> {
    while (retries > 0) {
      try {
        return await lastValueFrom(this.httpService.get(url, { params }));
      } catch (error) {
        retries -= 1;
        if (retries === 0) {
          throw new Error(
            `Failed to fetch data after ${retries} retries. Error: ${error.message}`,
          );
        }
        await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    // To fix Typescript error. This line will never be reached, since this function will either return or throw an error before this.
    throw new Error(`Failed to fetch data`);
  }
}
