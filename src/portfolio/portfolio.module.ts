import { forwardRef, Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { TradeModule } from 'src/trade/trade.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [
    DbModule,
    forwardRef(() => TradeModule)
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService]

})
export class PortfolioModule {}
