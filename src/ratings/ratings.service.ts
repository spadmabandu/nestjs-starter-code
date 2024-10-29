import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingInput } from './dto/create-rating.input';
import { UpdateRatingInput } from './dto/update-rating.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { RatingBoardsService } from 'src/rating-boards/rating-boards.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    private ratingBoardsService: RatingBoardsService,
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
      return await this.ratingRepository.save(rating);
    } catch (_) {
      throw new InternalServerErrorException('Failed to create Rating');
    }
  }

  // TODO createMany()

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
