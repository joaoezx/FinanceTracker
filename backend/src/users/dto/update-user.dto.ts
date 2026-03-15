import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateEmailDto extends PartialType(CreateUserDto) {
  email?: string;
}
