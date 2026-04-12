export type TransactionType = 'income' | 'expense';

export class CreateTransactionDto {
  description!: string;
  amount!: number;
  type?: TransactionType;
  category?: string;
  transactionDate?: string;
  cardId?: string;
  userId?: string;
}
