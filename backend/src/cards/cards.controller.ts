import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ImportTransactionsCsvDto } from './dto/import-transactions-csv.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Post('transactions')
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.cardsService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  findTransactions() {
    return this.cardsService.findTransactions();
  }

  @Post('transactions/import-csv')
  importTransactionsCsv(@Body() importTransactionsCsvDto: ImportTransactionsCsvDto) {
    return this.cardsService.importTransactionsCsv(importTransactionsCsvDto);
  }

  @Post('investments')
  createInvestment(@Body() createInvestmentDto: CreateInvestmentDto) {
    return this.cardsService.createInvestment(createInvestmentDto);
  }

  @Get('investments')
  findInvestments() {
    return this.cardsService.findInvestments();
  }

  @Get('investments/:id/yield/:months')
  calculateInvestmentYield(
    @Param('id') id: string,
    @Param('months') months: string,
  ) {
    return this.cardsService.calculateInvestmentYield(id, Number(months));
  }

  @Post('salary')
  createSalary(@Body() createSalaryDto: CreateSalaryDto) {
    return this.cardsService.createSalary(createSalaryDto);
  }

  @Get('salary')
  findSalaries() {
    return this.cardsService.findSalaries();
  }

  @Get('invoices/general/:year/:month')
  getGeneralInvoice(@Param('year') year: string, @Param('month') month: string) {
    return this.cardsService.getGeneralInvoice(Number(month), Number(year));
  }

  @Get('invoices/general')
  getCurrentGeneralInvoice() {
    return this.cardsService.getGeneralInvoice();
  }

  @Get(':id/invoice/:year/:month')
  getCardInvoice(
    @Param('id') id: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.cardsService.getCardInvoice(id, Number(month), Number(year));
  }

  @Get(':id/invoice')
  getCurrentCardInvoice(@Param('id') id: string) {
    return this.cardsService.getCardInvoice(id);
  }

  @Get(':id/transactions')
  findCardTransactions(@Param('id') id: string) {
    return this.cardsService.findTransactions(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}
