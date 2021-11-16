import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { TradeDto } from 'src/trade/dto/trade.dto';
import TradeType from 'src/trade/dto/tradeType.enum';
import PortfolioInterface from './interface/portfolio.interface';
import IPortfolioResponse from './interface/portfolio.response.interface';


@Injectable()
export class PortfolioService {
  constructor(
    private dbService: DbService,
  ){}

  compute(portfolio: PortfolioInterface, tradeDto: TradeDto, oldTradeDto: TradeDto): PortfolioInterface {
    let priceWeight = portfolio.price_weight;
    let averageBuyPrice = portfolio.average_buy_price;
    let noShares = portfolio.no_shares;
    if (oldTradeDto) {
      if (oldTradeDto.type === TradeType.BUY) {
        noShares = noShares - oldTradeDto.noOfShares;
        priceWeight = priceWeight - (oldTradeDto.price * oldTradeDto.noOfShares);
        averageBuyPrice = priceWeight === 0 && noShares === 0 ? 0 : priceWeight / noShares;
      } else {
        if (oldTradeDto.noOfShares <= noShares) {
          noShares = noShares + (oldTradeDto.noOfShares);
        } else {
          throw new BadRequestException('Cannot sell more than what is already present');
        }
      }
    }
    if (tradeDto) {
      if (tradeDto.type === TradeType.BUY) {
        noShares = noShares + tradeDto.noOfShares;
        priceWeight = priceWeight + (tradeDto.price * tradeDto.noOfShares);
        averageBuyPrice = priceWeight / noShares;
      } else {
        if (tradeDto.noOfShares <= noShares) {
          noShares = noShares + (oldTradeDto ? oldTradeDto.noOfShares : 0) - tradeDto.noOfShares;
        } else {
          throw new BadRequestException('Cannot sell more than what is already present');
        }
      }
    }
    return {
      ticker_symbol: tradeDto && oldTradeDto ? tradeDto.stockName : tradeDto ? tradeDto.stockName : oldTradeDto.stockName,
      price_weight: priceWeight,
      no_shares: noShares,
      average_buy_price: averageBuyPrice
    };
  }

  async insert(portfolio: PortfolioInterface): Promise<void> {
    const insertQuery = "insert into portfolio(ticker_symbol, price_weight, average_buy_price, no_shares) values($1,$2,$3,$4) RETURNING *";
    const values = [portfolio.ticker_symbol, portfolio.price_weight, portfolio.average_buy_price, portfolio.no_shares];
    await this.dbService.getClient().query(insertQuery, values);
  }

  async getPortfolioByTickerSymbol(tickerSymbol: string): Promise<Array<PortfolioInterface>> {
    const res = await this.dbService.getClient().query('select * from portfolio where ticker_symbol = $1', [tickerSymbol]);
    return res.rows;
  }
  async update(portfolio: PortfolioInterface): Promise<void> {
    const updateQuery = "update portfolio set price_weight = $1, average_buy_price = $2, no_shares = $3 where ticker_symbol = $4";
    const values = [portfolio.price_weight, portfolio.average_buy_price, portfolio.no_shares, portfolio.ticker_symbol];
    await this.dbService.getClient().query(updateQuery, values);
  }

  async upsert(tradeDto: TradeDto, oldTradeDto: TradeDto): Promise<void> {
    let oldPortfolio;
    let newPortfolio;
    // get old trade value and new value. revert old trade value and add new trade value.
    if (oldTradeDto) {
      oldPortfolio = await this.getPortfolioByTickerSymbol(oldTradeDto.stockName);
    }
    if (tradeDto) {
      newPortfolio = await this.getPortfolioByTickerSymbol(tradeDto.stockName);
    }
    if (tradeDto && oldTradeDto && tradeDto.stockName === oldTradeDto.stockName) {
      const updatedPortfolio = this.compute(newPortfolio[0], tradeDto, oldTradeDto);
      await this.update(updatedPortfolio);
    } else {
      if (tradeDto) {
        if (newPortfolio.length == 0) {
          newPortfolio.push({
            ticker_symbol: tradeDto.stockName,
            price_weight: 0,
            no_shares: 0,
            average_buy_price: 0
          });
          const updatedPortfolio = this.compute(newPortfolio[0], tradeDto, null);
          this.insert(updatedPortfolio);
        } else {
          const updatedPortfolio = this.compute(newPortfolio[0], tradeDto, null);
          await this.update(updatedPortfolio);
        }
      }
      if (oldTradeDto) {
        const updatedPortfolio_2 = this.compute(oldPortfolio[0], null, oldTradeDto);
        await this.update(updatedPortfolio_2);
      }
    }
  }

  async getPortfolio() : Promise<Array<IPortfolioResponse>> {
    const res = await this.dbService.getClient().query('select ticker_symbol as "stockName", average_buy_price as "averageBuyPrice", no_shares as "noOfShares" from portfolio');
    return res.rows;
  }
}
