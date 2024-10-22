import { ExternalSourceEnum } from 'src/video-games/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Platform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  summary: string;

  @Column({ comment: `Common abbreviation for the platform` })
  abbreviation: string;

  @Column()
  releaseDate: Date;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `Alternate names for the platform, if they exist`,
  })
  aliases?: string[];

  @Column({
    comment: `Main image associated with the platform`,
    nullable: true,
  })
  mainImage?: string;

  @Column({
    nullable: true,
    comment: `Unique ID of genre from external data source`,
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

  // Many to Many relationship with Company Entity
}
