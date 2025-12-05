import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ default: 'USDT_TRON' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  // Firebase URL of the screenshot
  @Column({ nullable: true })
  screenshotUrl?: string;

  @Column({ default: 'PENDING' }) // PENDING | APPROVED | REJECTED
  status: string;

  @Column({ nullable: true })
  adminId?: number;

  @Column({ nullable: true })
  rejectionReason?: string;

  // IP address of the user who created the deposit
  @Column({ nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
