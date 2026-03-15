import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { buildDatabaseConfig } from './config/database.config';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('DOTENV DB_HOST =>', process.env.DB_HOST);

console.log('CWD =>', process.cwd());
console.log('ENV EXISTS =>', existsSync(join(process.cwd(), '.env')));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildDatabaseConfig(configService),
    }),
    AuthModule,
    UsersModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
