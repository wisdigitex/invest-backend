import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from './deposit.entity';
import { DepositsService } from './deposits.service';
import { DepositsUserController } from './deposits.user.controller';
import { DepositsAdminController } from './deposits.admin.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    WalletsModule,
    FirebaseModule,
  ],
  providers: [DepositsService],
  controllers: [DepositsUserController, DepositsAdminController],
  exports: [DepositsService],
})
export class DepositsModule {}
