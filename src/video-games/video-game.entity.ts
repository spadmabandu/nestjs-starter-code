import { ExternalSourceEnum } from 'src/shared/types/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class VideoGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  summary: string;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `Alternate names for the video game, if they exist`,
  })
  aliases?: string[];

  @Column({ nullable: true })
  releaseDate?: Date;

  @Column({ nullable: true })
  expectedReleaseYear?: number;

  @Column({
    comment: `Expected release quarter, represented as a number (e.g., 1 = Q1)`,
    nullable: true,
  })
  expectedReleaseQuarter?: number;

  @Column({
    comment: `Expected release month of the game, represented as a number`,
    nullable: true,
  })
  expectedReleaseMonth?: number;

  @Column({
    comment: `Expected release day of the game, represented as a number`,
    nullable: true,
  })
  expectedReleaseDay?: number;

  @Column({
    comment: `Main image associated with the video game`,
    nullable: true,
  })
  mainImage?: string;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `All images associated with the video game`,
  })
  images?: string[];

  @Column({
    nullable: true,
    comment: `Unique ID of video game from external data source`,
  })
  externalId?: number;

  @Column({
    nullable: true,
    comment: `ID used for single item API calls to Giant Bomb API`,
  })
  guid?: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ExternalSourceEnum,
    comment: `Data source, if external`,
  })
  externalSource?: ExternalSourceEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Many to Many relationship with List Entity (Favorite, Wish List, Want to Play, Playing, Played, Custom List)

  // Many to Many relationship with Genre entity

  // Many to Many relationship with Platforms entity

  // Many to Many relationship with Company Entity

  // One to Many relationship with Ratings Entity
}
