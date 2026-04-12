import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { Investment } from './entities/investment.entity';
import { Salary } from './entities/salary.entity';
import { Transaction } from './entities/transaction.entity';

describe('CardsService', () => {
  let service: CardsService;
  const repositoryMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: repositoryMock },
        { provide: getRepositoryToken(Transaction), useValue: repositoryMock },
        { provide: getRepositoryToken(Investment), useValue: repositoryMock },
        { provide: getRepositoryToken(Salary), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
