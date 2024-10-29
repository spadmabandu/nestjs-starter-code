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
import { Repository } from 'typeorm';

@Injectable()
export class RatingBoardsService {
  constructor(
    @InjectRepository(RatingBoard)
    private ratingBoardRepository: Repository<RatingBoard>,
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

  // TODO createMany()

  findAll() {
    return this.ratingBoardRepository.find();
  }

  async findOneById(id: number): Promise<RatingBoard | null> {
    return this.ratingBoardRepository.findOneBy({ id });
  }

  async findOneByName(name: string): Promise<RatingBoard | null> {
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
