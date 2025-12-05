import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InvestmentPackage } from '././investment-package.entity';

@Entity('investment_categories')
export class InvestmentCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g. "AI Trading Bot"

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InvestmentPackage, (pkg) => pkg.category)
  packages: InvestmentPackage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
