import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import TradeType from './tradeType.enum';

export class TradeDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsEnum(TradeType, {message:"type must be either BUY or SELL"})
  type: string;

  @IsString()
  @IsNotEmpty()
  stockName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  noOfShares: number;
}