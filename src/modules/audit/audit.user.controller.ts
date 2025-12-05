import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditUserController {
  constructor(private readonly auditService: AuditService) {}

  @Get('me')
  async myLogs(@CurrentUser() user) {
    return this.auditService.getUserLogs(user.id);
  }
}
