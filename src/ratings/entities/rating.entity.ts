import { RatingBoard } from 'src/rating-boards/entities/rating-board.entity';
import { ExternalSourceEnum } from 'src/shared/types/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => RatingBoard, (ratingBoard) => ratingBoard.ratings)
  ratingBoard: RatingBoard;

  // Many to Many relationship with Game Entity
}
