import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: { findByEmailWithPassword: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmailWithPassword: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('/auth/login (POST) 400 when user not found', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nope@example.com', password: '123' })
      .expect(400);
  });

  it('/auth/login (POST) 400 when password invalid', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      password: 'hashed',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' })
      .expect(400);
  });

  it('/auth/login (POST) 201 when credentials valid', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      password: 'hashed',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('token-123');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'correct' })
      .expect(201)
      .expect({ acess_token: 'token-123' });
  });
});
