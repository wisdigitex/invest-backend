import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { InvestmentCategory } from './investment-category.entity';
import { UserInvestment } from '././user-investment.entity';

@Entity('investment_packages')
export class InvestmentPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InvestmentCategory, (cat) => cat.packages)
  @JoinColumn({ name: 'category_id' })
  category: InvestmentCategory;

  @Column()
  categoryId: number;

  @Column()
  name: string; // e.g. "Starter Plan"

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  maxAmount: number;

  @Column({ default: 'PERCENT_DAILY' }) // PERCENT_DAILY, FIXED_TOTAL if needed
  profitType: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  profitRate: number; // e.g. 1.5 => 1.5% daily

  @Column()
  durationDays: number;

  @Column({ default: 'DAILY' }) // DAILY, END_OF_TERM
  payoutFrequency: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserInvestment, (inv) => inv.package)
  userInvestments: UserInvestment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
