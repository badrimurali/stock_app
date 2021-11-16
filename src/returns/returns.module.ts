import { forwardRef, Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { PortfolioModule } from 'src/portfolio/portfolio.module';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  imports: [
    DbModule,
    forwardRef(() => PortfolioModule)
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService]
})
export class ReturnsModule {}
