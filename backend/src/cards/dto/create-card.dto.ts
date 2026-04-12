export class CreateCardDto {
  name!: string;
  bank!: string;
  description?: string;
  limit!: number;
  closingDay!: number;
  dueDay!: number;
  userId?: string;
}
