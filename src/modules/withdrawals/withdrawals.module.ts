import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './withdrawal.entity';
import { WithdrawalsService } from '././withdrawals.service';
import { WithdrawalsUserController } from './withdrawals.user.controller';
import { WithdrawalsAdminController } from '././withdrawals.admin.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';
import { InvestmentsModule } from '../investments/investments.module';
import { SettingsModule } from '../settings/settings.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal]),
    WalletsModule,
    UsersModule,
    InvestmentsModule,
    SettingsModule,
  ],
  providers: [WithdrawalsService],
  controllers: [WithdrawalsUserController, WithdrawalsAdminController],
})
export class WithdrawalsModule {}
