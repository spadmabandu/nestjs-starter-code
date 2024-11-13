import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { UsersModule } from './users/users.module';
import { IDatabaseConfig } from 'config/types';
import { validate } from '../config/config.validation';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { RatingBoardsModule } from './rating-boards/rating-boards.module';
import { RatingsModule } from './ratings/ratings.module';
import { DataPopulationModule } from './data-population/data-population.module';
import { GenresModule } from './genres/genres.module';
import { CompaniesModule } from './companies/companies.module';
import { PlatformsModule } from './platforms/platforms.module';
import { VideoGamesModule } from './video-games/video-games.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development'],
      isGlobal: true,
      cache: true,
      load: [databaseConfig],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<IDatabaseConfig>('database');
        if (!dbConfig) {
          throw new Error('Database configuration missing');
        }
        const { host, port, username, password, database } = dbConfig;
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true, // Load entities automatically without having to specify them
          synchronize: true, // TODO: turn off in Production
        };
      },
    }),
    AuthModule,
    CompaniesModule,
    DataPopulationModule,
    GenresModule,
    JwtTokenModule,
    PlatformsModule,
    RatingBoardsModule,
    RatingsModule,
    UsersModule,
    VideoGamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
