import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UpgradesService } from './upgrades.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('upgrades') // => /api/upgrades
export class UpgradesUserController {
  constructor(private readonly upgradesService: UpgradesService) {}

  @Get('levels')
  async list() {
    const levels = await this.upgradesService.getLevels();
    return {
      success: true,
      message: 'Available profile upgrade levels retrieved successfully',
      data: levels,
    };
  }

  @Post()
  async upgrade(
    @CurrentUser() user,
    @Body('levelId') levelId: number,
  ) {
    const upgradeResult = await this.upgradesService.upgradeUser(
      user.id,
      levelId,
    );

    return {
      success: true,
      message: 'Profile upgrade completed successfully',
      data: upgradeResult,
    };
  }
}
