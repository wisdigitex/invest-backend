import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralEarning } from './referral-earning.entity';
import { ReferralsService } from '././referrals.service';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';
import { ReferralsUserController } from '././referrals.user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralEarning]),
    UsersModule,
    WalletsModule,
  ],
  providers: [ReferralsService],
  controllers: [ReferralsUserController],
  exports: [ReferralsService],
})
export class ReferralsModule {}
