import { Controller, Get } from '@nestjs/common';
import IReturn from './dto/return.dto';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {};
  

  @Get()
  async getReturns(): Promise<IReturn> {
    return this.returnsService.getReturns();
  }
}
