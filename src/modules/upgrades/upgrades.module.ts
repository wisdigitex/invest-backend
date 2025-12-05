import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileLevel } from './profile-level.entity';
import { UpgradesService } from '././upgrades.service';
import { UpgradesUserController } from '././upgrades.user.controller';
import { UpgradesAdminController } from '././upgrades.admin.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileLevel]),
    WalletsModule,
    UsersModule,
  ],
  providers: [UpgradesService],
  controllers: [UpgradesUserController, UpgradesAdminController],
  exports: [UpgradesService],
})
export class UpgradesModule {}
