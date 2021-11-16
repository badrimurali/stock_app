import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TradeDto } from './dto/trade.dto';
import { TradeUpdateDto } from './dto/trade.update.dto';
import IResponse from './interface/Response.interface';
import { TradeService } from './trade.service';

@Controller('trades')
export class TradeController {

  constructor(private tradeService: TradeService) {}

  @Get()
  getTrade() {
    return this.tradeService.getTrades();
  }
  @Post()
  @UsePipes(ValidationPipe)
  addTrade(@Body() tradeDto: TradeDto): Promise<TradeDto> {
    return this.tradeService.addTrades(tradeDto);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateTrade(@Param('id', new ParseIntPipe()) id: number, @Body() tradeDto: TradeUpdateDto): Promise<TradeUpdateDto> {
    return this.tradeService.updateTrade(id, tradeDto);
  }

  @Delete('/:id')
  deleteTrade(@Param('id') id: number): Promise<IResponse> {
    return this.tradeService.deleteTrade(id);
  }
}
