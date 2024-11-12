import { Company } from 'src/companies/entities/company.entity';
import { Genre } from 'src/genres/entities/genre.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { ExternalSourceEnum } from 'src/shared/types/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class VideoGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `Alternate names for the video game, if they exist`,
  })
  aliases?: string[] | null;

  @Column({ type: 'date', nullable: true })
  releaseDate?: Date | null;

  @Column({ type: 'int', nullable: true })
  expectedReleaseYear?: number | null;

  @Column({
    comment: `Expected release quarter, represented as a number (e.g., 1 = Q1)`,
    type: 'int',
    nullable: true,
  })
  expectedReleaseQuarter?: number | null;

  @Column({
    comment: `Expected release month of the game, represented as a number`,
    type: 'int',
    nullable: true,
  })
  expectedReleaseMonth?: number | null;

  @Column({
    comment: `Expected release day of the game, represented as a number`,
    type: 'int',
    nullable: true,
  })
  expectedReleaseDay?: number | null;

  @Column({
    comment: `Main image associated with the video game`,
    type: 'varchar',
    nullable: true,
  })
  mainImage?: string | null;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `All images associated with the video game`,
  })
  images?: string[] | null;

  @Column({
    nullable: true,
    type: 'int',
    comment: `Unique ID of video game from external data source`,
  })
  externalId?: number | null;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: `ID used for single item API calls to Giant Bomb API`,
  })
  guid?: string | null;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ExternalSourceEnum,
    comment: `Data source, if external`,
  })
  externalSource?: ExternalSourceEnum | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Genre, (genre) => genre.videoGames, { nullable: true })
  @JoinTable()
  genres?: Genre[] | null;

  @ManyToMany(() => Platform, (platform) => platform.videoGames, {
    nullable: true,
  })
  @JoinTable()
  platforms?: Platform[] | null;

  @ManyToMany(() => Company, (company) => company.developedVideoGames, {
    nullable: true,
  })
  @JoinTable()
  developers?: Company[] | null;

  @ManyToMany(() => Company, (company) => company.publishedVideoGames, {
    nullable: true,
  })
  @JoinTable()
  publishers?: Company[] | null;

  @ManyToMany(() => Rating, (rating) => rating.videoGames, { nullable: true })
  @JoinTable()
  ratings?: Rating[] | null;

  // Many to Many relationship with List Entity (Favorite, Wish List, Want to Play, Playing, Played, Custom List)
}
