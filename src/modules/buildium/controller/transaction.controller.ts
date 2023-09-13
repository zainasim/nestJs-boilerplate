import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from '../services/transaction.service';

@ApiTags('modules.buldium')
@Controller({
    // version: '1',
    path: '/transaction',
})
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get('/create')
    async createTransactions(): Promise<any> {
        console.log('transactionssssssssssssss');
        return await this.transactionService.fetchAndCreatetransactions();
    }
}
