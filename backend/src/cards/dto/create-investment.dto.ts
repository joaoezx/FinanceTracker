export class CreateInvestmentDto {
  name!: string;
  amount!: number;
  monthlyRate!: number;
  investedAt?: string;
  userId?: string;
}
