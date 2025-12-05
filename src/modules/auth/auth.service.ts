import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallets/wallets.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
    private readonly jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        referrerId: user.referrerId,
        profileLevelId: user.profileLevelId,
        mainCurrency: user.mainCurrency,
        isAdmin: user.isAdmin,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    let referrerId: number | null = null;
    if (dto.referralCode) {
      const referrer = await this.usersService.findByReferralCode(
        dto.referralCode,
      );
      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
      referrerId = referrer.id;
    }

    const passwordHash = await this.hashPassword(dto.password);

    // Create user
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      referrerId,
    });

    // Create default wallet
    await this.walletsService.createDefaultWalletForUser(user.id);

    // Apply welcome bonus to bonusBalance
    await this.walletsService.applyWelcomeBonusIfEnabled(user.id);

    return {
      success: true,
      data: this.buildAuthResponse(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.validatePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    return {
      success: true,
      data: this.buildAuthResponse(user),
    };
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.usersService.findById(id);
  }
}
