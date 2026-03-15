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
    host: configService.get<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT')),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
    ssl: {
      rejectUnauthorized: false,
    },
  };
};
