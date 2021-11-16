import { Module } from '@nestjs/common';
import { TradeModule } from './trade/trade.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ReturnsModule } from './returns/returns.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env'}),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    TradeModule,
    PortfolioModule,
    ReturnsModule,
    DbModule],
})
export class AppModule {}
