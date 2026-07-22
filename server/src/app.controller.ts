import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }

  @Post('send-xlm')
  async sendXlm(
    @Body() body: { destination: string; amount: string; secretKey: string },
  ) {
    return this.appService.sendXlm(
      body.destination,
      body.amount,
      body.secretKey,
    );
  }

  @Post('transactions')
  async recordTransaction(
    @Body()
    body: {
      senderAddress: string;
      recipientAddress: string;
      amount: string;
      txHash?: string;
      status?: string;
    },
  ) {
    return this.appService.recordTransaction(body);
  }

  @Get('transactions')
  async getTransactions() {
    return this.appService.getTransactions();
  }
}
