import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(data: RegisterAuthDto) {
    const userAlreadyExists = await this.usersService.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    await this.usersService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return {
      message: 'Usuário criado com sucesso',
    };
  }

  async login(data: LoginAuthDto) {
    const user = await this.usersService.findByEmailWithPassword(data.email);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const passwordIsValid = await bcrypt.compare(data.password, user.password);

    if (!passwordIsValid) {
      throw new BadRequestException('E-mail ou Senha inválidos');
    }
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      acess_token: await this.jwtService.signAsync(payload),
    };
  }

  async validadeUser(userId: string) {
    return this.usersService.findOne(userId);
  }
}
