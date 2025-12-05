import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId: number;
    performedByAdminId?: number;
    action: string;
    amount?: number;
    referenceId?: number;
    referenceType?: string;
    meta?: any;
    ipAddress?: string;
  }) {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

  async getUserLogs(userId: number) {
    return this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllLogs() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
