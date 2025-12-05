import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('profile_levels')
export class ProfileLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // "Level 2", "Gold", etc.

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  cost: number;

  @Column({ default: false })
  bypassReferralRequirement: boolean;

  @Column({ default: false })
  bypassMinimumWithdrawal: boolean;

  @Column({ default: false })
  bypassEarningsRequirement: boolean;
}
