import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit } from './deposit.entity';
import { WalletsService } from './../wallets/wallets.service';

@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    private readonly walletService: WalletsService,
  ) {}

  // Create Deposit (User Request)
  async createDeposit(
    userId: number,
    amount: number,
    screenshotUrl?: string,
    ip?: string,
  ) {
    const data: Partial<Deposit> = {
      userId,
      amount,
      currency: 'USDT_TRON',
      screenshotUrl: screenshotUrl || undefined,
      status: 'PENDING',
    };

    if (ip) {
      data.ipAddress = ip;
    }

    const deposit = this.depositRepo.create(data);
    return this.depositRepo.save(deposit);
  }

  // USER — Get Their Deposits
  async getUserDeposits(userId: number) {
    return this.depositRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ADMIN — Get All Pending Deposits
  async getPendingDeposits() {
    return this.depositRepo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
    });
  }

  // ADMIN — Approve Deposit
  async approveDeposit(depositId: number, adminId: number): Promise<Deposit> {
    const deposit = await this.depositRepo.findOne({ where: { id: depositId } });

    if (!deposit) throw new NotFoundException('Deposit not found');

    deposit.status = 'APPROVED';
    deposit.adminId = adminId;

    await this.depositRepo.save(deposit);

    // Credit user wallet upon approval
    await this.walletService.creditWallet(deposit.userId, deposit.amount);

    return deposit;
  }

  // ADMIN — Reject Deposit
  async rejectDeposit(depositId: number, adminId: number, reason: string) {
    const deposit = await this.depositRepo.findOne({ where: { id: depositId } });

    if (!deposit) throw new NotFoundException('Deposit not found');

    deposit.status = 'REJECTED';
    deposit.adminId = adminId;
    deposit.rejectionReason = reason;

    return this.depositRepo.save(deposit);
  }
}
