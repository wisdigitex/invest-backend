import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ReferralsService } from './referrals.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('referrals') // => /api/referrals
export class ReferralsUserController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('history')
  async history(@CurrentUser() user) {
    const data = await this.referralsService.getReferralHistory(user.id);
    return {
      success: true,
      message: 'Referral earnings history retrieved successfully',
      data,
    };
  }

  @Get('count')
  async count(@CurrentUser() user) {
    const count = await this.referralsService.countReferrals(user.id);
    return {
      success: true,
      message: 'Referral count retrieved successfully',
      total: count,
    };
  }
}
