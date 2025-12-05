import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @Column({ default: 'USDT_TRON' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  availableBalance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  lockedBalance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  referralBalance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  bonusBalance: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
