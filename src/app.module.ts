// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import ormConfig from './config/orm.config';

import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuthModule } from './modules/auth/auth.module';
import { InvestmentsModule } from './modules/investments/investments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: ormConfig,
    }),

    ScheduleModule.forRoot(),

    UsersModule,
    WalletsModule,
    SettingsModule,
    AuthModule,
    InvestmentsModule,
  ],
})
export class AppModule {}
