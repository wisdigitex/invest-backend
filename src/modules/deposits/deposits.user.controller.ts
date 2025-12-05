import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { FirebaseService } from '../firebase/firebase.service';

@UseGuards(JwtAuthGuard)
@Controller('deposits') // => /api/deposits
export class DepositsUserController {
  constructor(
    private readonly depositsService: DepositsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('screenshot'))
  async createDeposit(
    @CurrentUser() user,
    @Body('amount') amount: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      null;

    let screenshotUrl: string | null = null;

    // If file uploaded, upload to Firebase
    if (file) {
      screenshotUrl = await this.firebaseService.uploadFile(
        file,
        'deposit_screenshots',
      );
    }

  const deposit = await this.depositsService.createDeposit(
    user.id,
    Number(amount),
    screenshotUrl || '',
    ip || ''
  );


    return {
      success: true,
      message: 'Deposit request submitted and waiting for approval',
      data: deposit,
    };
  }

  @Get()
  async getMyDeposits(@CurrentUser() user) {
    const list = await this.depositsService.getUserDeposits(user.id);
    return { success: true, data: list };
  }
}
