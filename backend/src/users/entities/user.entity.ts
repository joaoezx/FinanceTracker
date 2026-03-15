import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Timestamp,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @CreateDateColumn()
  created_at!: Timestamp;
}
