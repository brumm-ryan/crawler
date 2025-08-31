import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ScanResultsService, type CreateScanResultDto, ScanResultRead } from './scan-results.service';

@Controller('scan-results')
export class ScanResultsController {
  private readonly logger = new Logger(ScanResultsController.name);

  constructor(private readonly scanResultsService: ScanResultsService) {}


  @Get('scan/:scanId')
  async findAllForScan(@Param('scanId', ParseIntPipe) scanId: number): Promise<ScanResultRead[]> {
    this.logger.log(`Fetching scan results for scan ID: ${scanId}`);
    
    try {
      const result = await this.scanResultsService.findAllForScan(scanId);
      this.logger.log(`Successfully fetched ${result.length} scan results for scan ID: ${scanId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch scan results for scan ID: ${scanId}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to fetch scan results',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ScanResultRead> {
    this.logger.log(`Fetching scan result with ID: ${id}`);
    
    try {
      const scanResult = await this.scanResultsService.findOne(id);
      if (!scanResult) {
        throw new HttpException('Scan result not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`Successfully fetched scan result with ID: ${id}`);
      return scanResult;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch scan result with ID: ${id}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to fetch scan result',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; error?: string }
  ): Promise<ScanResultRead> {
    this.logger.log(`Updating status for scan result ID: ${id} to: ${body.status}`);
    
    try {
      const result = await this.scanResultsService.updateStatus(id, body.status, body.error);
      this.logger.log(`Successfully updated status for scan result ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update status for scan result ID: ${id}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to update scan result status',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}