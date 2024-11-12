import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { FindCompaniesInput } from './dto/find-companies.input';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private dataSource: DataSource,
  ) {}

  async create(createCompanyInput: CreateCompanyInput): Promise<Company> {
    const existingCompany = await this.companyRepository.findOneBy({
      externalId: createCompanyInput.externalId,
      externalSource: createCompanyInput.externalSource,
    });
    if (existingCompany) {
      throw new ConflictException('Company already exists');
    }

    const company = this.companyRepository.create(createCompanyInput);

    try {
      return await this.companyRepository.save(company);
    } catch (e) {
      throw new InternalServerErrorException(`Error creating company`);
    }
  }

  async createMany(
    createManyCompaniesInput: CreateCompanyInput[],
  ): Promise<Company[]> {
    // Wrap operations in a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const companies = createManyCompaniesInput.map((input) =>
        this.companyRepository.create(input),
      );
      const newCompanies = await queryRunner.manager.save(companies);

      // Commit all operations to database in a single transaction
      await queryRunner.commitTransaction();

      return newCompanies;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error bulk creating Companies`);
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findBy(
    where?: Partial<Record<keyof Company, any>>,
  ): Promise<Company[]> {
    return this.companyRepository.find({
      where,
    });
  }

  async findFieldsBy<T extends keyof Company>(
    fields: T[],
    where?: Partial<Record<keyof Company, any>>,
  ): Promise<Pick<Company, T>[]> {
    return this.companyRepository.find({
      select: fields,
      where,
    });
  }

  findManyBy(findCompaniesInput: FindCompaniesInput): Promise<Company[]> {
    const { ids } = findCompaniesInput;
    const where: FindOptionsWhere<Company> = {};

    if (ids) {
      where.id = In(ids);
    }

    return this.companyRepository.find({ where });
  }

  findByIds(ids: number[]): Promise<Company[]> {
    return this.companyRepository.find({
      where: { id: In(ids) },
    });
  }

  findOneById(id: number): Promise<Company | null> {
    return this.companyRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Company | null> {
    return this.companyRepository.findOneBy({ name });
  }

  async update(
    id: number,
    updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    const company = await this.findOneById(id);
    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    Object.assign(company, updateCompanyInput);

    try {
      return await this.companyRepository.save(company);
    } catch (e) {
      throw new InternalServerErrorException(`Error updating Company`);
    }
  }

  async remove(id: number): Promise<void> {
    const company = await this.findOneById(id);

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    try {
      await this.companyRepository.remove(company);
    } catch (e) {
      throw new InternalServerErrorException(`Error removing Company`);
    }
  }
}
