import { ExternalSourceEnum } from 'src/shared/types/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({
    comment: `Main image associated with the genre`,
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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Many to Many relationship with Game Entity
}