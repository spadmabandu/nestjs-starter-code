import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlatformInput } from './dto/create-platform.input';
import { UpdatePlatformInput } from './dto/update-platform.input';
import { Platform } from './entities/platform.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private platformRepository: Repository<Platform>,
    private companiesService: CompaniesService,
    private dataSource: DataSource,
  ) {}

  async create(createPlatformInput: CreatePlatformInput): Promise<Platform> {
    const { companyId, ...newPlatform } = createPlatformInput;
    const company = await this.companiesService.findOneById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    const platform = this.platformRepository.create({
      ...newPlatform,
      company,
    });

    try {
      return await this.platformRepository.save(platform);
    } catch (_) {
      throw new InternalServerErrorException('Failed to create Platform');
    }
  }

  async createMany(
    createManyPlatformsInput: CreatePlatformInput[],
  ): Promise<Platform[]> {
    // Wrap operations in a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const platforms = createManyPlatformsInput.map((createPlatformInput) => {
        const { companyId, ...newPlatform } = createPlatformInput;
        const platform = this.platformRepository.create({
          ...newPlatform,
          company: { id: companyId },
        });
        return platform;
      });

      // Queue new entities to be saved in queryRunner
      const savedPlatforms = await queryRunner.manager.save(platforms);

      // Commit all operations in a single transaction
      await queryRunner.commitTransaction();

      return savedPlatforms;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error bulk creating platforms`);
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Platform[]> {
    return this.platformRepository.find();
  }

  async findOne(id: number): Promise<Platform> {
    const platform = await this.platformRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!platform) {
      throw new NotFoundException(`Platform not found`);
    }
    return platform;
  }

  async findOneById(id: number): Promise<Platform | null> {
    return this.platformRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updatePlatformInput: UpdatePlatformInput,
  ): Promise<Platform> {
    const platform = await this.findOneById(id);
    if (!platform) {
      throw new NotFoundException(`Platform not found`);
    }

    Object.assign(platform, updatePlatformInput);

    try {
      return await this.platformRepository.save(platform);
    } catch (_) {
      throw new InternalServerErrorException(`Failed to update the Platform`);
    }
  }

  async remove(id: number): Promise<void> {
    const platform = await this.findOneById(id);

    if (!platform) {
      throw new NotFoundException(`Platform not found`);
    }

    try {
      await this.platformRepository.remove(platform);
    } catch (_) {
      throw new InternalServerErrorException(`Failed to remove the Platform`);
    }
  }
}
