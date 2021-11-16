import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { DbModule } from 'src/db/db.module';
import { PortfolioModule } from 'src/portfolio/portfolio.module';

@Module({
  imports: [
    DbModule,
    PortfolioModule,
  ],
  controllers: [TradeController],
  providers: [TradeService],
  exports: [TradeService]
})
export class TradeModule {}
