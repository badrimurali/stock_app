import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { DbService } from '../db/db.service';
import { TradeDto } from './dto/trade.dto';
import { TradeUpdateDto } from './dto/trade.update.dto';
import TradeType from './dto/tradeType.enum';
import IResponse from './interface/Response.interface';
import TradeInterface from './interface/trade.interface';

@Injectable()
export class TradeService {

  constructor(
    private dbService: DbService,
    private portfolioService: PortfolioService
  ){}

  async getTrades() {
    try { 
      const res = await this.dbService.getClient().query('SELECT * from trade order by ticker_symbol');
      return this.createTradeDto(res.rows);
    }
    catch (err) {
      throw new InternalServerErrorException('Unable to fetch trades');
    }
  }

  createTradeDto(tradeObjects: Array<TradeInterface>) : Array<TradeDto> {
    const result = [];
    for (const tradeObject of tradeObjects) {
      const tradeDto: TradeDto = {
        id: tradeObject.id,
        type: tradeObject.type,
        stockName: tradeObject.ticker_symbol,
        noOfShares: tradeObject.no_shares,
        price: tradeObject.price
      }
      result.push(tradeDto);
    }
    return result;
  }

  creatTradeInterface(tradeDtos: Array<TradeDto> | Array<TradeUpdateDto>): Array<TradeInterface> {
    const result = [];
    for (const tradeDto of tradeDtos) {
      const tradeInterface: TradeInterface = {};
      if (tradeDto.type) {
        tradeInterface.type = tradeDto.type;
      }
      if (tradeDto.price) {
        tradeInterface.price = tradeDto.price;
      }
      if (tradeDto.stockName) {
        tradeInterface.ticker_symbol = tradeDto.stockName;
      }
      if (tradeDto.noOfShares) {
        tradeInterface.no_shares = tradeDto.noOfShares;
      }
      result.push(tradeInterface);
    }
    return result;
  }

  async addTrades(tradeDto: TradeDto): Promise<TradeDto> {
    try {
      await this.portfolioService.upsert(tradeDto, null);
      const insertQuery = "INSERT INTO trade(type, ticker_symbol, no_shares, price) VALUES($1, $2, $3, $4) RETURNING *";
      const values = [tradeDto.type, tradeDto.stockName, tradeDto.noOfShares, tradeDto.price];
      const res = await this.dbService.getClient().query(insertQuery, values);
      return this.createTradeDto(res.rows)[0];
    } catch (insertError) {
      if (insertError instanceof BadRequestException) {
        throw insertError;
      }
      throw new InternalServerErrorException('Unable to save trade');
    }
  }

  async getTradeById(tradeId: number): Promise<Array<TradeDto>> {
    const res = await this.dbService.getClient().query('select * from trade where id = $1', [tradeId]);
    return res.rows;
  }

  async updateTrade(tradeId: number, tradeUpdateDto: TradeUpdateDto): Promise<TradeUpdateDto> {
    const rows = await this.getTradeById(tradeId);
    if (rows.length === 0) {
      throw new NotFoundException('Trade not found');
    }
    const tradeInterfaces: Array<TradeInterface> = this.creatTradeInterface([tradeUpdateDto]);
    const oldTradeDto = this.createTradeDto(rows)[0];
    const trade: TradeDto = {
      ...oldTradeDto,
      ...tradeUpdateDto
    }
    try {
      await this.portfolioService.upsert(trade, oldTradeDto);
      let values = [];
      const argKeys = Object.keys(tradeInterfaces[0]).map((key,index) => { 
        values.push(tradeInterfaces[0][key]);
        return key + "= $"+(index+1);
      }).join(','); 
      const updateQuery = "UPDATE trade SET "+argKeys+" WHERE id = $"+(Object.keys(tradeInterfaces[0]).length + 1)+" RETURNING *";
      values.push(tradeId);
      const res = await this.dbService.getClient().query(updateQuery, values);
      return this.createTradeDto(res.rows)[0];
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Unable to update trade');
    }
  }

  async deleteTrade(tradeId: number): Promise<IResponse> {
    const rows = await this.getTradeById(tradeId);
    if (rows.length === 0) {
      throw new NotFoundException('Trade not found');
    }
    try {
      const tradeDto = this.createTradeDto(rows)[0];
      tradeDto.type = tradeDto.type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;
      this.portfolioService.upsert(null, tradeDto);
      const deleteQuery = 'delete from trade where id = $1';
      const res = this.dbService.getClient().query(deleteQuery, [tradeId]);
      return {status: 'success', message: 'Trade deleted successfully'};
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Unable to delete trade');
    }
  }
}