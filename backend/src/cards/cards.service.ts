import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { CreateSalaryDto } from './dto/create-salary.dto';
import {
  CreateTransactionDto,
  TransactionType as TransactionTypeDto,
} from './dto/create-transaction.dto';
import { ImportTransactionsCsvDto } from './dto/import-transactions-csv.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { Investment } from './entities/investment.entity';
import { Salary } from './entities/salary.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const card = this.cardRepository.create({
      ...createCardDto,
      limit: Number(createCardDto.limit),
      user: createCardDto.userId ? { id: createCardDto.userId } : undefined,
    });

    return this.cardRepository.save(card);
  }

  findAll() {
    return this.cardRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: { user: true, transactions: true },
    });

    if (!card) {
      throw new NotFoundException('Cartao nao encontrado');
    }

    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.findOne(id);
    Object.assign(card, {
      ...updateCardDto,
      limit:
        updateCardDto.limit === undefined ? card.limit : Number(updateCardDto.limit),
      user: updateCardDto.userId ? { id: updateCardDto.userId } : card.user,
    });

    return this.cardRepository.save(card);
  }

  async remove(id: string) {
    const card = await this.findOne(id);
    await this.cardRepository.remove(card);
    return card;
  }

  async createTransaction(dto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      description: dto.description,
      amount: Number(dto.amount),
      type: this.toTransactionType(dto.type),
      category: dto.category,
      transactionDate: dto.transactionDate ?? this.today(),
      card: dto.cardId ? { id: dto.cardId } : undefined,
      user: dto.userId ? { id: dto.userId } : undefined,
    });

    return this.transactionRepository.save(transaction);
  }

  findTransactions(cardId?: string) {
    return this.transactionRepository.find({
      where: cardId ? { card: { id: cardId } } : {},
      relations: { card: true, user: true },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async importTransactionsCsv(dto: ImportTransactionsCsvDto) {
    const rows = this.parseCsv(dto.csv);
    const transactions = rows.map((row) =>
      this.transactionRepository.create({
        description: row.description,
        amount: this.toNumber(row.amount, 'amount'),
        type: this.toTransactionType(row.type),
        category: row.category,
        transactionDate: row.transactionDate ?? row.date ?? this.today(),
        card: row.cardId ?? dto.cardId ? { id: row.cardId ?? dto.cardId } : undefined,
        user: row.userId ?? dto.userId ? { id: row.userId ?? dto.userId } : undefined,
      }),
    );

    return this.transactionRepository.save(transactions);
  }

  async createInvestment(dto: CreateInvestmentDto) {
    const investment = this.investmentRepository.create({
      name: dto.name,
      amount: Number(dto.amount),
      monthlyRate: Number(dto.monthlyRate),
      investedAt: dto.investedAt ?? this.today(),
      user: dto.userId ? { id: dto.userId } : undefined,
    });

    return this.investmentRepository.save(investment);
  }

  findInvestments() {
    return this.investmentRepository.find({
      relations: { user: true },
      order: { investedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async calculateInvestmentYield(id: string, months: number) {
    if (!Number.isFinite(months) || months < 0) {
      throw new BadRequestException('Meses deve ser um numero maior ou igual a zero');
    }

    const investment = await this.investmentRepository.findOneBy({ id });

    if (!investment) {
      throw new NotFoundException('Investimento nao encontrado');
    }

    const principal = Number(investment.amount);
    const monthlyRate = Number(investment.monthlyRate);
    const income = principal * monthlyRate * months;

    return {
      investment,
      months,
      principal,
      monthlyRate,
      income,
      total: principal + income,
    };
  }

  async createSalary(dto: CreateSalaryDto) {
    const salary = this.salaryRepository.create({
      amount: Number(dto.amount),
      description: dto.description,
      paymentDay: dto.paymentDay,
      user: dto.userId ? { id: dto.userId } : undefined,
    });

    return this.salaryRepository.save(salary);
  }

  findSalaries() {
    return this.salaryRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getCardInvoice(cardId: string, month?: number, year?: number) {
    await this.findOne(cardId);
    return this.buildInvoice({ cardId, month, year });
  }

  getGeneralInvoice(month?: number, year?: number) {
    return this.buildInvoice({ month, year });
  }

  private async buildInvoice(params: {
    cardId?: string;
    month?: number;
    year?: number;
  }) {
    const { start, end } = this.getMonthRange(params.month, params.year);
    const transactions = await this.transactionRepository.find({
      where: {
        type: TransactionType.EXPENSE,
        transactionDate: Between(start, end),
        ...(params.cardId ? { card: { id: params.cardId } } : {}),
      },
      relations: { card: true },
      order: { transactionDate: 'ASC' },
    });

    const total = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );

    return {
      cardId: params.cardId,
      month: Number(start.slice(5, 7)),
      year: Number(start.slice(0, 4)),
      start,
      end,
      total,
      transactions,
    };
  }

  private parseCsv(csv: string): Array<Record<string, string>> {
    const lines = csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new BadRequestException('CSV deve conter cabecalho e ao menos uma linha');
    }

    const headers = this.splitCsvLine(lines[0]);

    return lines.slice(1).map((line) => {
      const values = this.splitCsvLine(line);
      const row = headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] ?? '';
        return acc;
      }, {});

      if (!row.description || !row.amount) {
        throw new BadRequestException(
          'CSV deve conter as colunas description e amount',
        );
      }

      return row;
    });
  }

  private splitCsvLine(line: string) {
    return line
      .split(',')
      .map((value) => value.trim().replace(/^"|"$/g, ''));
  }

  private toTransactionType(type?: TransactionTypeDto | string) {
    if (!type) return TransactionType.EXPENSE;

    if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE) {
      throw new BadRequestException('Tipo deve ser income ou expense');
    }

    return type;
  }

  private getMonthRange(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Mes deve estar entre 1 e 12');
    }

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(Date.UTC(year, month, 0));
    const end = endDate.toISOString().slice(0, 10);

    return { start, end };
  }

  private toNumber(value: number | string, field: string) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new BadRequestException(`${field} deve ser um numero valido`);
    }

    return number;
  }

  private today() {
    return new Date().toISOString().slice(0, 10);
  }
}
