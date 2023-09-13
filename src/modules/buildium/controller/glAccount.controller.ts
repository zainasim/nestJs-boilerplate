import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { glAccountService } from 'src/modules/buildium/services/glaccount.service';


import {
    Response,
    ResponseExcel,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import { AssociationGetSerialization } from '../serializations/association.get.serialization';
import { AssociationListSerialization } from '../serializations/association.list.serialization';
import { getGlAccountsDto } from '../dtos/get.glaccount.dto';

@ApiTags('modules.buldium')
@Controller({
    // version: '1',
    path: '/glAccounts',
})
export class GlAccountControllrtController {
    constructor(private readonly glAccountService: glAccountService) {}


    @Get('/glAccounts')
    async fetchAndSaveGlaccounts(): Promise<any> {
      return  await this.glAccountService.fetchGlAccounts();
    }

    // @ResponsePaging('buildium.list', {
    //     serialization: AssociationListSerialization,
    // })
    @Get('/glAccountslisting')
    async fetchListing(
      @Query() queryParams: any,
    ): Promise<any> {
      const { Type } = queryParams;
      let associationList = await this.glAccountService.findAll({ Type });
      return {
        data: associationList,
      };
    }

    @Delete('/delete')
    async deleteGlAccounts(
      @Query() queryParams: any,
    ): Promise<any> {
      const { Type } = queryParams;
      let associationList = await this.glAccountService.deleteMany({ });
      return {
        data: associationList,
      };
    }

    @Get('/glAccountsReserves')
    async fetchReserves(
      @Query() queryParams: any,
    ): Promise<any> {
      const { Type } = queryParams;
      let reserves = await this.glAccountService.fetchAndCreateReserves();
      return {
        data: reserves,
      };
    }

}
