import { Injectable } from '@nestjs/common';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import IReturn from './dto/return.dto';

@Injectable()
export class ReturnsService {
  constructor(private portfolioService: PortfolioService) {}

  // 1. get portfolios
  // 2. formula = sum(currentPrice(100) - averageBuyPrice) * noOfShares
  async getReturns(): Promise<IReturn> {
    const portfolios = await this.portfolioService.getPortfolio();
    let result = 0;
    for (const portfolio of portfolios) {
      let returnResult;
      if( portfolio.averageBuyPrice === 0){
        returnResult = 0;
      } else {
        returnResult = Math.abs(100 - portfolio.averageBuyPrice) * portfolio.noOfShares;
      }
      result = result + (portfolio.averageBuyPrice > 100 ? -returnResult : returnResult);
    }
    return {returns: result};
  }
}
