import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

import { DatabaseService } from './database.service';
import { ProductEntity } from './entities';
import { ProductRepository } from './repositories';

const postgresRepositories = [ProductRepository];
const postgresEntities = [ProductEntity];
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: postgresEntities,
      schema: 'public',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    TypeOrmModule.forFeature(postgresEntities),
  ],
  providers: [DatabaseService, ...postgresRepositories],
  exports: [DatabaseService, TypeOrmModule, ...postgresRepositories],
})
export class DatabaseModule { }
