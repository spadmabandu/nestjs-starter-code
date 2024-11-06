import { ExternalSourceEnum } from 'src/shared/types/types';
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
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ comment: `Common abbreviation for the company`, nullable: true })
  abbreviation?: string;

  @Column({ nullable: true })
  dateFounded?: Date;

  @Column({ nullable: true })
  website?: string;

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

  @Column({
    nullable: true,
  })
  streetAddress?: string;

  @Column({
    nullable: true,
  })
  city?: string;

  @Column({
    nullable: true,
  })
  state?: string;

  @Column({
    nullable: true,
  })
  country?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Many to Many relationship with Game Entity

  // Many to Many relationship with Platform Entity
}
