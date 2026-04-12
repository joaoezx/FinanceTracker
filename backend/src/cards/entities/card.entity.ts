import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  bank!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  limit!: number;

  @Column({ type: 'int' })
  closingDay: number;

  @Column({ type: 'int' })
  dueDay: number;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.card)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;
}
