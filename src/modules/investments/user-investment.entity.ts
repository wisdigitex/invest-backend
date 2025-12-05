import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InvestmentPackage } from './investment-package.entity';
import { User } from '../users/user.entity';

@Entity('user_investments')
export class UserInvestment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => InvestmentPackage, (pkg) => pkg.userInvestments)
  @JoinColumn({ name: 'package_id' })
  package: InvestmentPackage;

  @Column()
  packageId: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ default: 'USDT_TRON' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalEarned: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalExpectedProfit: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: 'ACTIVE' }) // ACTIVE, COMPLETED, CANCELLED
  status: string;

  @Column({ nullable: true })
  lastPayoutAt: Date;

  // BALANCE or BONUS – where the investment funds came from
  @Column({ default: 'BALANCE' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
