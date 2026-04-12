import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const buildDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  console.log('DB_HOST =>', configService.get<string>('DB_HOST'));
  console.log('DB_PORT =>', configService.get<string>('DB_PORT'));
  console.log('DB_USER =>', configService.get<string>('DB_USER'));
  console.log('DB_NAME =>', configService.get<string>('DB_NAME'));

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<string>('DB_PORT', '5432')),
    username: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME', 'financetracker'),
    autoLoadEntities: true,
    synchronize: true,
  };
};
