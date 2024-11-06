import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingBoardInput } from './dto/create-rating-board.input';
import { UpdateRatingBoardInput } from './dto/update-rating-board.input';
import { RatingBoard } from './entities/rating-board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RatingBoardsService {
  constructor(
    @InjectRepository(RatingBoard)
    private ratingBoardRepository: Repository<RatingBoard>,
    private dataSource: DataSource,
  ) {}

  async create(
    createRatingBoardInput: CreateRatingBoardInput,
  ): Promise<RatingBoard> {
    const existingRatingBoard = await this.findOneByName(
      createRatingBoardInput.name,
    );
    if (existingRatingBoard) {
      throw new ConflictException('Rating Board already exists');
    }

    const ratingBoard = this.ratingBoardRepository.create(
      createRatingBoardInput,
    );

    try {
      return await this.ratingBoardRepository.save(ratingBoard);
    } catch (_) {
      throw new InternalServerErrorException(
        'Failed to create the Rating Board',
      );
    }
  }

  async createMany(
    createManyRatingBoardsInput: CreateRatingBoardInput[],
  ): Promise<RatingBoard[]> {
    // De-duplicate rating boards that already exist in the database
    const existingRatingBoards = await this.ratingBoardRepository.find({
      select: ['name'],
    });
    const existingRatingBoardsSet = new Set(
      existingRatingBoards.map((ratingBoard) => ratingBoard.name),
    );

    const newRatingBoards = createManyRatingBoardsInput.filter(
      (input) => !existingRatingBoardsSet.has(input.name),
    );
    if (newRatingBoards.length === 0) {
      return [];
    }

    // Wrap operations in a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ratingBoards = newRatingBoards.map((input) =>
        this.ratingBoardRepository.create(input),
      );
      const savedRatingBoards = await queryRunner.manager.save(ratingBoards);

      // Commit all operations in a single transaction
      await queryRunner.commitTransaction();

      return savedRatingBoards;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error bulk creating Rating Boards`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<RatingBoard[]> {
    return this.ratingBoardRepository.find();
  }

  findOneById(id: number): Promise<RatingBoard | null> {
    return this.ratingBoardRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<RatingBoard | null> {
    return this.ratingBoardRepository.findOneBy({ name });
  }

  async update(
    id: number,
    updateRatingBoardInput: UpdateRatingBoardInput,
  ): Promise<RatingBoard> {
    const ratingBoard = await this.findOneById(id);
    if (!ratingBoard) {
      throw new NotFoundException(`Rating Board not found`);
    }

    Object.assign(ratingBoard, updateRatingBoardInput);

    try {
      return await this.ratingBoardRepository.save(ratingBoard);
    } catch (_) {
      throw new InternalServerErrorException(
        `Failed to update the Rating Board`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const ratingBoard = await this.findOneById(id);

    if (!ratingBoard) {
      throw new NotFoundException(`Rating Board not found`);
    }

    try {
      await this.ratingBoardRepository.remove(ratingBoard);
    } catch (_) {
      throw new InternalServerErrorException(
        `Failed to remove the Rating Board`,
      );
    }
  }
}
