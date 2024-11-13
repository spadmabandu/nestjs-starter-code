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
import { CreateVideoGameInput } from 'src/video-games/dto/create-video-game.input';
import { VideoGamesService } from 'src/video-games/video-games.service';
import { Not } from 'typeorm';

@Injectable()
export class DataPopulationService {
  private readonly BATCH_SIZE = 2;
  private readonly DELAY_BETWEEN_REQUESTS_MS = 1 * 60 * 1000; // 1 minute delay

  constructor(
    private readonly httpService: HttpService,
    private readonly companiesService: CompaniesService,
    private readonly configService: ConfigService,
    private readonly genresService: GenresService,
    private readonly platformsService: PlatformsService,
    private readonly ratingBoardsService: RatingBoardsService,
    private readonly ratingsService: RatingsService,
    private readonly videoGamesService: VideoGamesService,
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

  // TODO - CONVERT THIS TO A JOB
  async populateVideoGames() {
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');
    const videoGamesUrl = `${GIANT_BOMB_API_BASE_URL}/games`;

    // Fetch related entities to associate with each video game
    const [companies, genres, platforms, ratings] = await Promise.all([
      this.companiesService.findFieldsBy(['id', 'externalId'], {
        externalSource: ExternalSourceEnum.GIANT_BOMB,
      }),
      this.genresService.findFieldsBy(['id', 'externalId'], {
        externalSource: ExternalSourceEnum.GIANT_BOMB,
      }),
      this.platformsService.findFieldsBy(['id', 'externalId'], {
        externalSource: ExternalSourceEnum.GIANT_BOMB,
      }),
      this.ratingsService.findFieldsBy(['id', 'externalId'], {
        externalSource: ExternalSourceEnum.GIANT_BOMB,
      }),
    ]);

    // Create maps of each entity's external id to its internal database id
    const companyMap = this.hashMapUtil(companies);
    const genreMap = this.hashMapUtil(genres);
    const platformMap = this.hashMapUtil(platforms);
    const ratingMap = this.hashMapUtil(ratings);
    // TODO - FETCH VIDEO GAMES FROM INTERNAL DATABASE AND ONLY CREATE
    // A NEW RECORD IF THE GUID IS NOT ALREADY IN THE DATABASE

    // Fetch batch of video games from /games endpoint
    let totalToFetch: number = 2; // TODO - SET BACK TO 0
    let totalFetched: number = 0;
    let totalSaved: number = 0;
    let page: number = 1;

    while (totalFetched === 0 || totalFetched < totalToFetch) {
      try {
        // Fetch video games data from Giant Bomb API
        const response: AxiosResponse = await this.fetchDataWithRetries(
          videoGamesUrl,
          {
            api_key: apiKey,
            format: 'json',
            offset: (page - 1) * this.BATCH_SIZE,
            limit: this.BATCH_SIZE,
          },
        );

        const { number_of_page_results, number_of_total_results, results } =
          response.data;

        // Update number of results fetched
        totalFetched += number_of_page_results;
        // TODO - UNCOMMENT WHEN PROCESSING ALL DATA
        // totalToFetch = number_of_total_results;
        page += 1;

        // For each video game, fetch detailed video game data from /game endpoint
        const videoGamesSaved = await this.processVideoGames(
          results,
          companyMap,
          platformMap,
          genreMap,
          ratingMap,
          totalSaved,
        );

        totalSaved += videoGamesSaved;

        // Inject delay between retrieving batches of games to avoid hitting API rate limits
        // await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
      } catch (error) {
        console.error(
          `Error fetching page ${page}. Fetched ${totalFetched} of ${totalToFetch} video games. Total saved: ${totalSaved}`,
          error,
        );
        throw new Error(error);
      }
    }

    return `Retrieved and processed ${totalFetched} of ${totalToFetch} video games. Total video games saved: ${totalSaved}`;
  }

  async processVideoGames(
    results: any[],
    companyMap: Map<number, number>,
    platformMap: Map<number, number>,
    genreMap: Map<number, number>,
    ratingMap: Map<number, number>,
    totalSaved: number,
  ) {
    let videoGamesSaved = totalSaved;
    const apiKey = this.configService.get<string>('GIANT_BOMB_API_KEY');

    for (const videoGame of results) {
      const { guid } = videoGame;
      const videoGameUrl = `${GIANT_BOMB_API_BASE_URL}/game/${guid}`;
      try {
        const gameResponse: AxiosResponse = await this.fetchDataWithRetries(
          videoGameUrl,
          {
            api_key: apiKey,
            format: 'json',
          },
        );

        const {
          id,
          name,
          aliases = null,
          deck = null,
          description = null,
          expected_release_day = null,
          expected_release_month = null,
          expected_release_quarter = null,
          expected_release_year = null,
          image: { original_url = null } = {},
          original_release_date = null,
          platforms,
          developers,
          genres,
          publishers,
          original_game_rating,
          images,
        } = gameResponse.data.results || {};

        // Map related entities to internal database ids
        // TODO - for now, filter out any related entities that do not exist in the internal database.
        // Come back later to throw an error instead, after all other data has been populated.
        const internalDevelopers: number[] = developers
          ?.map((developer: any) => {
            const external_developer_id = developer?.id ?? null;
            const internalDeveloperId = companyMap.get(external_developer_id);
            return internalDeveloperId;
          })
          .filter((input: number | undefined) => input !== undefined);

        const internalPlatforms: number[] = platforms
          ?.map((platform: any) => {
            const external_platform_id = platform?.id ?? null;
            const internalPlatformId = platformMap.get(external_platform_id);
            return internalPlatformId;
          })
          .filter((input: number | undefined) => input !== undefined);

        const internalGenres: number[] = genres
          ?.map((genre: any) => {
            const external_genre_id = genre?.id ?? null;
            const internalGenreId = genreMap.get(external_genre_id);
            return internalGenreId;
          })
          .filter((input: number | undefined) => input !== undefined);

        const internalPublishers: number[] = publishers
          ?.map((publisher: any) => {
            const external_publisher_id = publisher?.id ?? null;
            const internalPublisherId = companyMap.get(external_publisher_id);
            return internalPublisherId;
          })
          .filter((input: number | undefined) => input !== undefined);

        const internalRatings: number[] = original_game_rating
          ?.map((rating: any) => {
            const external_rating_id = rating?.id ?? null;
            const internalRatingId = ratingMap.get(external_rating_id);
            return internalRatingId;
          })
          .filter((input: number | undefined) => input !== undefined);

        // Convert aliases to a string array
        const aliasesArray: string[] = aliases ? aliases.split(/\r?\n/) : null;

        // Convert images to a string array of the original_url fields
        const imagesArray: string[] = images
          ? images.map((image: any) => image.original)
          : null;

        // Create video game in database
        const createVideoGameInput: CreateVideoGameInput = {
          name,
          description,
          summary: deck,
          mainImage: original_url,
          externalId: id,
          guid,
          externalSource: ExternalSourceEnum.GIANT_BOMB,
          releaseDate: original_release_date,
          aliases: aliasesArray,
          expectedReleaseDay: expected_release_day,
          expectedReleaseMonth: expected_release_month,
          expectedReleaseQuarter: expected_release_quarter,
          expectedReleaseYear: expected_release_year,
          images: imagesArray,
          genreIds: internalGenres,
          platformIds: internalPlatforms,
          developerIds: internalDevelopers,
          publisherIds: internalPublishers,
          ratingIds: internalRatings,
        };

        await this.videoGamesService.create(createVideoGameInput);
        videoGamesSaved += 1;
      } catch (error) {
        console.error(`Error processing video game guid: ${guid}`, error);
      }

      // Inject delay between retrieving detailed video game data to avoid hitting API rate limits
      await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
    }

    return videoGamesSaved;
  }

  private hashMapUtil(
    entities: { id: number; externalId?: number }[],
  ): Map<number, number> {
    const map = new Map<number, number>();
    entities.forEach((entity) => {
      if (entity.externalId) {
        map.set(entity.externalId, entity.id);
      }
    });
    return map;
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
