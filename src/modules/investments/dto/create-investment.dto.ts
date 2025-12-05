import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateInvestmentDto {
  @IsNumber()
  packageId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsBoolean()
  useBonus?: boolean; // default false
}
