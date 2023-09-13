import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Query,
    Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from '../services/report.service';
import { ReportDto } from '../dtos/report.create.dto';
import { Response } from 'express';
import * as AWS from 'aws-sdk';

@ApiTags('modules.report')
@Controller({
    version: '1',
    path: '/report',
})
export class ReportController {
    constructor(
        private readonly reportService: ReportService
    ) {}

    @Post('/generate')
    async createReport(@Body() body: ReportDto, @Res() res: Response): Promise<any> {
        const data: any = await this.reportService.fetchAndGenerateReport(body);
        if(!data ) {
            return res.send({
                statusCode: 404,
            });            
        }
        return res.send({
            statusCode: 200,
            gridData: data,
        });
    }

    @Post('/generate-report')
    async createReportBlob(@Body() body: any, @Res() res: Response): Promise<any> {
        const reportData = await this.reportService.generateReportBlob(body);
        let s3: AWS.S3;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
        s3 = new AWS.S3({
            accessKeyId: 'AKIA3J2GPSSDASLZMWNR',
            secretAccessKey: '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'
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const params: AWS.S3.PutObjectRequest = {
            Bucket: 'forthgrp-s3',
            Key: 'exported-file.xlsx',
            Body: reportData,
        };

        const result = await s3.upload(params).promise();
        
        return res.send({
            statusCode: 200,
            data: result
        });
    }
    
    @Delete('/delete')
    async deleteReport(@Query() queryParams: any): Promise<any> {
        return await this.reportService.deleteMany({});
    }
}
