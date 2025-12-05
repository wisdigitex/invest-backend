import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { WithdrawalsService } from './withdrawals.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/withdrawals')
export class WithdrawalsAdminController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get('pending')
  async pending() {
    return this.withdrawalsService.getPending();
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: number,
    @Body('txHash') txHash: string,
    @CurrentUser() admin,
  ) {
    return this.withdrawalsService.approve(Number(id), admin.id, txHash);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: number,
    @Body('reason') reason: string,
    @CurrentUser() admin,
  ) {
    return this.withdrawalsService.reject(Number(id), admin.id, reason);
  }
}
