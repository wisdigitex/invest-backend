import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InvestmentCategory } from './investment-category.entity';
import { InvestmentPackage } from './investment-package.entity';
import { UserInvestment } from './user-investment.entity';
import { WalletsService } from '../wallets/wallets.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { UsersService } from '../users/users.service';


@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

constructor(
  @InjectRepository(InvestmentCategory)
  private readonly categoryRepo: Repository<InvestmentCategory>,

  @InjectRepository(InvestmentPackage)
  private readonly packageRepo: Repository<InvestmentPackage>,

  @InjectRepository(UserInvestment)
  private readonly userInvRepo: Repository<UserInvestment>,

  private readonly walletService: WalletsService,
  private readonly referralsService: ReferralsService,   // <-- ADD
  private readonly usersService: UsersService,           // <-- ADD
) {}


  // ---------- Admin methods ----------

  async createCategory(name: string, description?: string) {
    const exists = await this.categoryRepo.findOne({ where: { name } });
    if (exists) {
      throw new BadRequestException('Category with this name already exists');
    }
    const cat = this.categoryRepo.create({ name, description });
    return this.categoryRepo.save(cat);
  }

  async createPackage(data: {
    categoryId: number;
    name: string;
    minAmount: number;
    maxAmount: number;
    profitRate: number;
    durationDays: number;
    payoutFrequency: string;
  }) {
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });
    if (!category) throw new BadRequestException('Invalid category');

    const pkg = this.packageRepo.create({
      categoryId: data.categoryId,
      name: data.name,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
      profitType: 'PERCENT_DAILY',
      profitRate: data.profitRate,
      durationDays: data.durationDays,
      payoutFrequency: data.payoutFrequency || 'DAILY',
      isActive: true,
    });

    return this.packageRepo.save(pkg);
  }

  async listPackages() {
    return this.packageRepo.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async listCategories() {
    return this.categoryRepo.find({ order: { id: 'ASC' } });
  }

  // ---------- User investment methods ----------

  async createInvestment(userId: number, dto: CreateInvestmentDto) {
    const pkg = await this.packageRepo.findOne({
      where: { id: dto.packageId, isActive: true },
    });
    if (!pkg) throw new NotFoundException('Investment package not found');

    const amount = dto.amount;
    if (amount < Number(pkg.minAmount) || amount > Number(pkg.maxAmount)) {
      throw new BadRequestException(
        `Amount must be between ${pkg.minAmount} and ${pkg.maxAmount}`,
      );
    }
    

    const useBonus = dto.useBonus ?? false;

    // Debit wallet
    try {
      await this.walletService.debitForInvestment(userId, amount, useBonus);
    } catch (err) {
      throw new BadRequestException(err.message || 'Insufficient balance');
    }

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + pkg.durationDays);

    let totalExpectedProfit = 0;
    if (pkg.profitType === 'PERCENT_DAILY') {
      const dailyRate = Number(pkg.profitRate) / 100;
      totalExpectedProfit = amount * dailyRate * pkg.durationDays;
    }

    const inv = this.userInvRepo.create({
      userId,
      packageId: pkg.id,
      amount,
      currency: 'USDT_TRON',
      totalEarned: 0,
      totalExpectedProfit,
      startDate: start,
      endDate: end,
      status: 'ACTIVE',
      source: useBonus ? 'BONUS' : 'BALANCE',
    });

    const saved = await this.userInvRepo.save(inv);

    // AFTER saving investment (inv)
    const refUser = await this.usersService.findById(userId);
    if (refUser && refUser.referrerId) {
      const percentage = Number(process.env.REFERRAL_EARNING_PERCENT || 3);
      const earning = (dto.amount * percentage) / 100;

      await this.referralsService.recordEarning(
        refUser.referrerId,
        userId,
        saved.id,
        earning,
      );
    }
  // ------------------- REFERRAL EARNINGS END -------------------
    return saved;
  }

  async getUserInvestments(userId: number, status?: string) {
    const where: any = { userId };
    if (status && status !== 'ALL') where.status = status;

    return this.userInvRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['package'],
    });
  }

  async getUserInvestmentById(userId: number, id: number) {
    const inv = await this.userInvRepo.findOne({
      where: { id, userId },
      relations: ['package'],
    });
    if (!inv) throw new NotFoundException('Investment not found');
    return inv;
  }


  

  // ---------- Profit Cron (daily) ----------

  @Cron(CronExpression.EVERY_HOUR)
  async handleDailyProfits() {
    const now = new Date();
    this.logger.log('Running daily profit job...');

    // Get all ACTIVE investments where endDate >= now
    const activeInvestments = await this.userInvRepo.find({
      where: {
        status: 'ACTIVE',
        endDate: LessThanOrEqual(now),
      },
    });

    // First: mark investments completed when endDate passed
    for (const inv of activeInvestments) {
      if (inv.endDate <= now) {
        inv.status = 'COMPLETED';
        await this.userInvRepo.save(inv);
      }
    }

    // Now pay daily profits to investments not yet completed
    const active = await this.userInvRepo.find({
      where: { status: 'ACTIVE' },
      relations: ['package'],
    });

    for (const inv of active) {
      const pkg = inv.package;

      if (pkg.payoutFrequency !== 'DAILY') continue;

      const last = inv.lastPayoutAt || inv.startDate;
      const diffMs = now.getTime() - last.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 1) continue; // not yet one day since last payout

      const daysToPay = Math.floor(diffDays);
      const dailyRate = Number(pkg.profitRate) / 100;
      const dailyProfit = Number(inv.amount) * dailyRate;

      const totalProfitToPay = dailyProfit * daysToPay;

      // Credit profit to wallet
      await this.walletService.creditProfit(inv.userId, totalProfitToPay);

      inv.totalEarned = Number(inv.totalEarned || 0) + totalProfitToPay;
      inv.lastPayoutAt = now;

      // If we've reached/endDate or totalExpectedProfit, mark completed
      if (now >= inv.endDate) {
        inv.status = 'COMPLETED';
      }

      await this.userInvRepo.save(inv);
    }

    this.logger.log('Daily profit job finished');
  }
}
