import { RatingBoard } from 'src/rating-boards/entities/rating-board.entity';
import { ExternalSourceEnum } from 'src/shared/types/types';
import { VideoGame } from 'src/video-games/entities/video-game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => RatingBoard, (ratingBoard) => ratingBoard.ratings)
  ratingBoard: RatingBoard;

  // Many to Many relationship with Game Entity
  @ManyToMany(() => VideoGame, (videoGame) => videoGame.ratings, {
    nullable: true,
  })
  videoGames?: VideoGame[];
}
