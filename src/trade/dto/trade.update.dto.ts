import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import TradeType from './tradeType.enum';

export class TradeUpdateDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsOptional()
  @IsEnum(TradeType, {message:"type must be either BUY or SELL"})
  type: string;

  @IsString()
  @IsOptional()
  stockName: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  noOfShares: number;
}