import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from './withdrawal.entity';
import { WalletsService } from '../wallets/wallets.service';
import { UsersService } from '../users/users.service';
import { ProfileLevel } from '../upgrades/profile-level.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepo: Repository<Withdrawal>,

    @InjectRepository(ProfileLevel)
    private readonly levelRepo: Repository<ProfileLevel>,

    private readonly walletService: WalletsService,
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService, // ⬅ Inject settings
  ) {}

  async validateWithdrawalRules(userId: number, amount: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Load profile level config
    const level = await this.levelRepo.findOne({
      where: { id: user.profileLevelId },
    });

    if (!level) {
      throw new BadRequestException('User level configuration missing');
    }

    // --------------------------------------------------------------------------------
    // RULE 1: Minimum Withdrawal (Dynamic via settings)
    // --------------------------------------------------------------------------------
    const minWithdrawal = Number(
      await this.settingsService.get('MIN_WITHDRAWAL_AMOUNT'),
    ) || 500;

    if (!level.bypassMinimumWithdrawal && amount < minWithdrawal) {
      throw new BadRequestException(
        `Minimum withdrawal is $${minWithdrawal}`,
      );
    }

    // --------------------------------------------------------------------------------
    // RULE 2: Referrals Requirement (Dynamic)
    // --------------------------------------------------------------------------------
    const requiredReferrals = Number(
      await this.settingsService.get('REQUIRED_REFERRALS'),
    ) || 5;

    if (!level.bypassReferralRequirement) {
      const referrals = await this.countReferrals(userId);
      if (referrals < requiredReferrals) {
        throw new BadRequestException(
          `You must refer at least ${requiredReferrals} users to withdraw`,
        );
      }
    }

    // --------------------------------------------------------------------------------
    // RULE 3: Earnings Requirement — (Dynamic)
    // --------------------------------------------------------------------------------
    const requiredEarnings = Number(
      await this.settingsService.get('REQUIRED_EARNINGS'),
    ) || 100;

    if (!level.bypassEarningsRequirement) {
      const wallet = await this.walletService.getWallet(userId);

      const totalEarned =
        Number(wallet.availableBalance) + Number(wallet.referralBalance);

      if (totalEarned < requiredEarnings) {
        throw new BadRequestException(
          `You must earn at least $${requiredEarnings} before withdrawing`,
        );
      }
    }

    // --------------------------------------------------------------------------------
    // RULE 4: Wallet Must Have Enough Balance
    // --------------------------------------------------------------------------------
    const wallet = await this.walletService.getWallet(userId);
    if (parseFloat(wallet.availableBalance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return true;
  }

  async countReferrals(userId: number): Promise<number> {
    const users = await this.usersService.findAll();
    return users.filter((u) => u.referrerId === userId).length;
  }

  async requestWithdrawal(userId: number, amount: number) {
    await this.validateWithdrawalRules(userId, amount);

    // Deduct immediately and set status pending
    await this.walletService.debitForInvestment(userId, amount, false);

    const withdrawal = this.withdrawalRepo.create({
      userId,
      amount,
      currency: 'USDT_TRON',
      status: 'PENDING',
    });

    return this.withdrawalRepo.save(withdrawal);
  }

  async getUserWithdrawals(userId: number) {
    return this.withdrawalRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPending() {
    return this.withdrawalRepo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
    });
  }

  async approve(withdrawalId: number, adminId: number, txHash: string) {
    const wd = await this.withdrawalRepo.findOne({ where: { id: withdrawalId } });
    if (!wd) throw new NotFoundException('Withdrawal not found');

    wd.status = 'APPROVED';
    wd.adminId = adminId;
    wd.txHash = txHash;
    return this.withdrawalRepo.save(wd);
  }

  async reject(withdrawalId: number, adminId: number, reason: string) {
    const wd = await this.withdrawalRepo.findOne({ where: { id: withdrawalId } });
    if (!wd) throw new NotFoundException('Withdrawal not found');

    // Refund since we already deducted during request
    await this.walletService.creditWallet(wd.userId, wd.amount);

    wd.status = 'REJECTED';
    wd.adminId = adminId;
    wd.rejectionReason = reason;
    return this.withdrawalRepo.save(wd);
  }
}
