import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { SettingsService } from '././settings.service';
import { SettingsAdminController } from '././settings.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingsService],
  controllers: [SettingsAdminController],
  exports: [SettingsService],
})
export class SettingsModule {}
