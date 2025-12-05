import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator'; // make sure this path matches your project

@UseGuards(JwtAuthGuard)
@Controller('investments') // => /api/investments
export class InvestmentsUserController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('packages')
  async getPackages() {
    return this.investmentsService.listPackages();
  }

  @Post()
  async createInvestment(
    @CurrentUser() user,
    @Body() dto: CreateInvestmentDto,
  ) {
    const inv = await this.investmentsService.createInvestment(user.id, dto);
    return {
      success: true,
      data: inv,
    };
  }

  @Get()
  async getMyInvestments(
    @CurrentUser() user,
    @Query('status') status?: string,
  ) {
    const list = await this.investmentsService.getUserInvestments(
      user.id,
      status,
    );
    return {
      success: true,
      data: list,
    };
  }

  @Get(':id')
  async getInvestment(
    @CurrentUser() user,
    @Param('id') id: number,
  ) {
    const inv = await this.investmentsService.getUserInvestmentById(
      user.id,
      Number(id),
    );
    return {
      success: true,
      data: inv,
    };
  }
}
