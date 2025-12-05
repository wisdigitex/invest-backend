import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentCategory } from './investment-category.entity';
import { InvestmentPackage } from './investment-package.entity';
import { UserInvestment } from './user-investment.entity';
import { InvestmentsService } from './investments.service';
import { InvestmentsUserController } from './investments.user.controller';
import { InvestmentsAdminController } from './investments.admin.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';
import { ReferralsModule } from '../referrals/referrals.module'; // <-- ADD THIS
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestmentCategory,
      InvestmentPackage,
      UserInvestment,
    ]),
    WalletsModule,
    UsersModule,
    ReferralsModule, // <-- ADD THIS
    ScheduleModule,
  ],
  providers: [InvestmentsService],
  controllers: [InvestmentsUserController, InvestmentsAdminController],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
