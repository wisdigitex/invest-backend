import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralEarning } from './referral-earning.entity';
import { WalletsService } from '../wallets/wallets.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralEarning)
    private readonly referralRepo: Repository<ReferralEarning>,
    private readonly walletService: WalletsService,
    private readonly usersService: UsersService,
  ) {}

  async recordEarning(referrerId: number, referredUserId: number, investmentId: number, amount: number) {
    const earning = this.referralRepo.create({
      userId: referrerId,
      referredUserId,
      investmentId,
      amount,
      currency: 'USDT_TRON',
    });

    await this.referralRepo.save(earning);

    // Credit to wallet REFERRAL BALANCE
    await this.walletService.creditReferralBonus(referrerId, amount);
  }

  async getReferralHistory(userId: number) {
    return this.referralRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async countReferrals(userId: number): Promise<number> {
    const users = await this.usersService.findAll();
    return users.filter((u) => u.referrerId === userId).length;
  }
}
