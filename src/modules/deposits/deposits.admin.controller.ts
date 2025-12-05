import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DepositsService } from './deposits.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/deposits') // => /api/admin/deposits
export class DepositsAdminController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get('pending')
  async getPending() {
    const list = await this.depositsService.getPendingDeposits();
    return {
      success: true,
      message: 'Pending deposit requests retrieved successfully',
      data: list,
    };
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: number,
    @CurrentUser() admin,
  ) {
    const result = await this.depositsService.approveDeposit(
      Number(id),
      admin.id,
    );
    return {
      success: true,
      message: 'Deposit approved successfully',
      data: result,
    };
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: number,
    @Body('reason') reason: string,
    @CurrentUser() admin,
  ) {
    const result = await this.depositsService.rejectDeposit(
      Number(id),
      admin.id,
      reason,
    );
    return {
      success: true,
      message: 'Deposit rejected successfully',
      data: result,
    };
  }
}
