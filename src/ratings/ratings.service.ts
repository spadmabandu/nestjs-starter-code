import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingInput } from './dto/create-rating.input';
import { UpdateRatingInput } from './dto/update-rating.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { DataSource, Repository } from 'typeorm';
import { RatingBoardsService } from 'src/rating-boards/rating-boards.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    private ratingBoardsService: RatingBoardsService,
    private dataSource: DataSource,
  ) {}

  async create(createRatingInput: CreateRatingInput): Promise<Rating> {
    const { ratingBoardId, ...newRating } = createRatingInput;
    const ratingBoard =
      await this.ratingBoardsService.findOneById(ratingBoardId);

    if (!ratingBoard) {
      throw new NotFoundException(`Rating Board not found`);
    }

    const rating = this.ratingRepository.create({ ...newRating, ratingBoard });

    try {
      return this.ratingRepository.save(rating);
    } catch (_) {
      throw new InternalServerErrorException('Failed to create Rating');
    }
  }

  async createMany(
    createManyRatingsInput: CreateRatingInput[],
  ): Promise<Rating[]> {
    // De-duplicate ratings that already exist in the database
    const existingRatings = await this.ratingRepository.find({
      select: ['name'],
    });
    const existingRatingsSet = new Set(
      existingRatings.map((rating) => rating.name),
    );

    const newRatings = createManyRatingsInput.filter(
      (rating) => !existingRatingsSet.has(rating.name),
    );

    // Wrap operations in a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ratings = newRatings.map((createRatingInput) => {
        const { ratingBoardId, ...newRating } = createRatingInput;

        const rating = this.ratingRepository.create({
          ...newRating,
          ratingBoard: { id: ratingBoardId },
        });
        return rating;
      });
      const savedRatings = await queryRunner.manager.save(ratings);

      // Commit all operations to database in a single transaction
      await queryRunner.commitTransaction();

      return savedRatings;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error bulk creating ratings`);
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Rating[]> {
    return this.ratingRepository.find();
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['ratingBoard'],
    });
    if (!rating) {
      throw new NotFoundException(`Rating not found`);
    }
    return rating;
  }

  async findOneById(id: number): Promise<Rating | null> {
    return this.ratingRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateRatingInput: UpdateRatingInput,
  ): Promise<Rating> {
    const rating = await this.findOneById(id);
    if (!rating) {
      throw new NotFoundException(`Rating not found`);
    }

    Object.assign(rating, updateRatingInput);

    try {
      return await this.ratingRepository.save(rating);
    } catch (_) {
      throw new InternalServerErrorException(`Failed to update the Rating`);
    }
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOneById(id);

    if (!rating) {
      throw new NotFoundException(`Rating not found`);
    }

    try {
      await this.ratingRepository.remove(rating);
    } catch (_) {
      throw new InternalServerErrorException(`Failed to remove the Rating`);
    }
  }
}
