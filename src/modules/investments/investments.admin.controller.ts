import { Body, Controller, Get, Post } from '@nestjs/common';
import { InvestmentsService } from './investments.service';

@Controller('admin/investments') // => /api/admin/investments
export class InvestmentsAdminController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('categories')
  async createCategory(
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    const cat = await this.investmentsService.createCategory(name, description);
    return { success: true, data: cat };
  }

  @Get('categories')
  async listCategories() {
    const cats = await this.investmentsService.listCategories();
    return { success: true, data: cats };
  }

  @Post('packages')
  async createPackage(
    @Body()
    body: {
      categoryId: number;
      name: string;
      minAmount: number;
      maxAmount: number;
      profitRate: number;
      durationDays: number;
      payoutFrequency: string;
    },
  ) {
    const pkg = await this.investmentsService.createPackage(body);
    return { success: true, data: pkg };
  }

  @Get('packages')
  async listPackages() {
    const pkgs = await this.investmentsService.listPackages();
    return { success: true, data: pkgs };
  }
}
