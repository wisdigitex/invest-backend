import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletsService {
  [x: string]: any;
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepo: Repository<Wallet>,
  ) {}

  async createDefaultWalletForUser(userId: number): Promise<Wallet> {
    const currency = process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON';

    // Check if already exists (safety)
    const exists = await this.walletsRepo.findOne({
      where: { userId, currency },
    });
    if (exists) return exists;

    const wallet = this.walletsRepo.create({
      userId,
      currency,
      availableBalance: '0',
      lockedBalance: '0',
      referralBalance: '0',
      bonusBalance: '0',
    });

    return this.walletsRepo.save(wallet);
  }

  async applyWelcomeBonusIfEnabled(userId: number): Promise<void> {
    const enabled = (process.env.WELCOME_BONUS_ENABLED || 'false') === 'true';
    if (!enabled) return;

    const amount = parseFloat(process.env.WELCOME_BONUS_AMOUNT || '0');
    const currency = process.env.WELCOME_BONUS_CURRENCY || 'USDT_TRON';
    if (!amount || amount <= 0) return;

    const wallet = await this.walletsRepo.findOne({
      where: { userId, currency },
    });

    if (!wallet) {
      this.logger.warn(
        `Wallet not found for user ${userId} when applying welcome bonus`,
      );
      return;
    }

    const currentBonus = parseFloat(wallet.bonusBalance || '0');
    wallet.bonusBalance = (currentBonus + amount).toString();

    await this.walletsRepo.save(wallet);
    this.logger.log(`Applied welcome bonus of ${amount} ${currency} to user ${userId}`);
  }
    async creditWallet(userId: number, amount: number): Promise<void> {
    const currency = process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON';

    const wallet = await this.walletsRepo.findOne({ where: { userId, currency } });

    if (!wallet) throw new Error('Wallet not found');

    const current = parseFloat(wallet.availableBalance || '0');
    wallet.availableBalance = (current + amount).toString();

    await this.walletsRepo.save(wallet);
  }

  async debitForInvestment(userId: number, amount: number, useBonus: boolean): Promise<void> {
  const currency = process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON';

  const wallet = await this.walletsRepo.findOne({ where: { userId, currency } });

  if (!wallet) throw new Error('Wallet not found');

  if (useBonus) {
    const bonus = parseFloat(wallet.bonusBalance || '0');
    if (bonus < amount) {
      throw new Error('Insufficient bonus balance');
    }
    wallet.bonusBalance = (bonus - amount).toString();
  } else {
    const avail = parseFloat(wallet.availableBalance || '0');
    if (avail < amount) {
      throw new Error('Insufficient available balance');
    }
    wallet.availableBalance = (avail - amount).toString();
  }

  await this.walletsRepo.save(wallet);
}

async creditProfit(userId: number, amount: number): Promise<void> {
  const currency = process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON';

  const wallet = await this.walletsRepo.findOne({ where: { userId, currency } });
  if (!wallet) throw new Error('Wallet not found');

  const avail = parseFloat(wallet.availableBalance || '0');
  wallet.availableBalance = (avail + amount).toString();

  await this.walletsRepo.save(wallet);
}
async creditReferralBonus(userId: number, amount: number): Promise<void> {
  const currency = process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON';

  const wallet = await this.walletsRepo.findOne({ where: { userId, currency } });
  if (!wallet) throw new Error('Wallet not found');

  const current = parseFloat(wallet.referralBalance || '0');
  wallet.referralBalance = (current + amount).toString();

  await this.walletsRepo.save(wallet);
}


}
