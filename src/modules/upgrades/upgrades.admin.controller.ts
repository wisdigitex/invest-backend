import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UpgradesService } from './upgrades.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/upgrades') // => /api/admin/upgrades
export class UpgradesAdminController {
  constructor(private readonly upgradesService: UpgradesService) {}

  @Get('levels')
  async list() {
    const levels = await this.upgradesService.getLevels();
    return {
      success: true,
      message: 'Upgrade levels retrieved successfully',
      data: levels,
    };
  }

  @Post('levels')
  async create(
    @Body()
    body: {
      name: string;
      cost: number;
      bypassReferralRequirement: boolean;
      bypassMinimumWithdrawal: boolean;
      bypassEarningsRequirement: boolean;
    },
  ) {
    const level = await this.upgradesService.createLevel(body);
    return {
      success: true,
      message: 'New upgrade level created successfully',
      data: level,
    };
  }
}
