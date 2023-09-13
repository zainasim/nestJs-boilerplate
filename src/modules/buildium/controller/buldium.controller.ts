import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssociationService } from 'src/modules/buildium/services/buildium.service';

import {
    Response,
    ResponseExcel,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';

import { AssociationListSerialization } from '../serializations/association.list.serialization';
import { ReserveListSerialization } from '../serializations/reserve.list.serializatio.';

@ApiTags('modules.buldium')
@Controller({
    // version: '1',
    path: '/properties',
})
export class BuildiumController {
    constructor(private readonly associationService: AssociationService) {}

    @Get('/createproperties')
    async createAssociations(): Promise<any> {
        return await this.associationService.fetchAssiations();
    }

    @Delete('/delete')
    async deleteAssociations(): Promise<any> {
      return  await this.associationService.deleteMany({});
    }

    @ResponsePaging('buildium.list', {
        serialization: AssociationListSerialization,
    })
    @Get('/listing')
    async fetchLIsting(): Promise<any> {
        let associationList = await this.associationService.findAll();
        return {
            data: associationList,
        };
    }

    @ResponsePaging('buildium.list', {
        serialization: AssociationListSerialization,
    })
    @Get('/getPropert')
    async fetchOneListing(@Query() queryParams: any): Promise<any> {
        const { id } = queryParams;

        let associationList = await this.associationService.findOne({ id });
        return {
            data: associationList,
        };
    }

    @ResponsePaging('reserve.list', {
      serialization: ReserveListSerialization,
  })
  @Get('/getreserves')
  async fetchReserves(@Query() queryParams: any): Promise<any> {
      
      let associationList = await this.associationService.findReserve({ });
      return {
          data: associationList,
      };
  }
}
