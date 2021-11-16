import { Controller, Get } from '@nestjs/common';
import PortfolioInterface from './interface/portfolio.interface';
import IPortfolioResponse from './interface/portfolio.response.interface';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService
  ) {}

  @Get()
  async getPortfolio(): Promise<Array<IPortfolioResponse>> {
    return this.portfolioService.getPortfolio();
  }
}
