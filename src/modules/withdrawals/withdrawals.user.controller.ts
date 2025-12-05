import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { WithdrawalsService } from './withdrawals.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('withdrawals') // => /api/withdrawals
export class WithdrawalsUserController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  async requestWithdrawal(
    @CurrentUser() user,
    @Body('amount') amount: number,
  ) {
    const wd = await this.withdrawalsService.requestWithdrawal(
      user.id,
      Number(amount),
    );
    return { success: true, data: wd };
  }

  @Get()
  async getMyWithdrawals(@CurrentUser() user) {
    const list = await this.withdrawalsService.getUserWithdrawals(user.id);
    return { success: true, data: list };
  }
}
