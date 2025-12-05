import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true, unique: true })
  telegramId: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ unique: true })
  referralCode: string;

  @Column({ type: 'int', nullable: true })
  referrerId: number | null;

  @Column({ default: 1 })
  profileLevelId: number; // Level 1 = default

  @Column({ default: 'USDT_TRON' })
  mainCurrency: string;

  @Column({ nullable: true })
  withdrawalWalletAddress: string;

  @Column({ default: false })
  isBanned: boolean;

    @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
}

