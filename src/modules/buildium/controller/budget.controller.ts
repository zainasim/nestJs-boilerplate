import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { budgetService } from 'src/modules/buildium/services/budget.service';

import {
    Response,
    ResponseExcel,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import { AssociationGetSerialization } from '../serializations/association.get.serialization';
import { AssociationListSerialization } from '../serializations/association.list.serialization';
import { getGlAccountsDto } from '../dtos/get.glaccount.dto';
import { createBudgetsDto } from '../dtos/budget.create.dto';
import { BudgetListSerialization } from '../serializations/budget.get.serialization';

@ApiTags('modules.buldium')
@Controller({
    // version: '1',
    path: '/buildiumapi',
})
export class BudgetController {
    constructor(private readonly budgetService: budgetService) {}

    @Delete('/delete')
    async deleteBudgets(): Promise<any> {
      return  await this.budgetService.deleteMany({});
    }

    @Get('/bugets')
    async fetchAndSaveGlaccounts(): Promise<any> {
      return  await this.budgetService.fetchBudgets();
    }

    @ResponsePaging('budget.list', {
        serialization: BudgetListSerialization,
    })
    @Get('/budgetlisting')
    async fetchListing(
      @Query() queryParams: createBudgetsDto,
    ): Promise<any> {

      const { propertyId } = queryParams;
       
      let associationList = await this.budgetService.findAll({ propertyId });
      return {
        data: associationList,
      };
    }


}
