import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfileLevel } from './profile-level.entity';
import { WalletsService } from '../wallets/wallets.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class UpgradesService {
  constructor(
    @InjectRepository(ProfileLevel)
    private readonly levelRepo: Repository<ProfileLevel>,
    private readonly walletService: WalletsService,
    private readonly usersService: UsersService,
  ) {}

  async getLevels() {
    return this.levelRepo.find({ order: { id: 'ASC' } });
  }

  async createLevel(data: {
    name: string;
    cost: number;
    bypassReferralRequirement: boolean;
    bypassMinimumWithdrawal: boolean;
    bypassEarningsRequirement: boolean;
  }) {
    const level = this.levelRepo.create(data);
    return this.levelRepo.save(level);
  }

  async upgradeUser(userId: number, levelId: number) {
    const level = await this.levelRepo.findOne({ where: { id: levelId } });
    if (!level) throw new NotFoundException('Upgrade level not found');

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.profileLevelId >= levelId) {
      throw new BadRequestException('You already have this or higher level');
    }

    // Deduct cost
    await this.walletService.debitForInvestment(userId, Number(level.cost), false);

    // Update user level
    user.profileLevelId = levelId;
    await this.usersService.updateUser(user);

    return { success: true, newLevel: level };
  }
}
