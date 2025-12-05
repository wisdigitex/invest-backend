import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // who is affected

  @Column({ nullable: true })
  performedByAdminId: number; // who performed action

  @Column()
  action: string; // e.g. "DEPOSIT_APPROVED"

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  amount: number;

  @Column({ nullable: true })
  referenceId: number; // depositId, withdrawalId, investmentId etc.

  @Column({ nullable: true })
  referenceType: string; // "DEPOSIT", "WITHDRAWAL", "INVESTMENT"

  @Column({ type: 'json', nullable: true })
  meta: any; // store other data

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
