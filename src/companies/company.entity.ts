import { ExternalSourceEnum } from 'src/video-games/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  summary: string;

  @Column({ comment: `Common abbreviation for the company` })
  abbreviation: string;

  @Column()
  dateFounded: Date;

  @Column()
  website: string;

  @Column('text', {
    array: true,
    nullable: true,
    comment: `Alternate names for the company, if they exist`,
  })
  aliases?: string[];

  @Column({
    comment: `Main image associated with the company`,
    nullable: true,
  })
  mainImage?: string;

  @Column({
    nullable: true,
    comment: `Unique ID of the company from external data source`,
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

  // Many to Many relationship with Game Entity

  // Many to Many relationship with Platform Entity
}
