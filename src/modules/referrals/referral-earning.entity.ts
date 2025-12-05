import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('referral_earnings')
export class ReferralEarning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // The referrer receiving earnings

  @Column()
  referredUserId: number; // Who generated the earning

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column()
  investmentId: number;

  @Column({ default: 'USDT_TRON' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
