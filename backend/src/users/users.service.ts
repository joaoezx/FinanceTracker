import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateEmailDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: string, dto: UpdateEmailDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;
    await this.userRepository.remove(user);
    return user;
  }
}
