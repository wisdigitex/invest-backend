import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByReferralCode(code: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { referralCode: code } });
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let code: string = '';
    let exists = true;

    while (exists) {
      code = randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.usersRepo.findOne({ where: { referralCode: code } });
      if (!existing) exists = false;
    }

    return code;
  }


  async createUser(params: {
    email: string;
    passwordHash: string;
    referrerId?: number | null;
  }): Promise<User> {
    const referralCode = await this.generateUniqueReferralCode();

    const user = this.usersRepo.create({
      email: params.email,
      passwordHash: params.passwordHash,
      referrerId: params.referrerId || undefined,
      referralCode,
      profileLevelId: 1,
      mainCurrency: process.env.DEFAULT_MAIN_CURRENCY || 'USDT_TRON',
    });

    return this.usersRepo.save(user);
  }
  
  async updateUser(user: User): Promise<User> {
  return this.usersRepo.save(user);
}


}
