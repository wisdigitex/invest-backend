import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ default: 'USDT_TRON' })
  currency: string;

  @Column({ default: 'PENDING' }) // PENDING | APPROVED | REJECTED
  status: string;

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  adminId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
