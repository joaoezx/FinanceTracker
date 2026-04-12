import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';
import { Investment } from './entities/investment.entity';
import { Salary } from './entities/salary.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Investment, Salary, Transaction])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
