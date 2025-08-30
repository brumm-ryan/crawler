import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ScansService, type CreateScanDto, ScanRead } from './scans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth.service';

@Controller('scans')
@UseGuards(JwtAuthGuard)
export class ScansController {
  private readonly logger = new Logger(ScansController.name);

  constructor(private readonly scansService: ScansService) {}

  @Post()
  async create(
    @Body() createScanDto: CreateScanDto,
    @Req() req: Request & { user: AuthUser }
  ): Promise<ScanRead> {
    this.logger.log(`Creating new scan for datasheet ID: ${createScanDto.datasheetId} (User: ${req.user.email})`);
    this.logger.debug(`Create scan payload:`, JSON.stringify(createScanDto, null, 2));
    
    try {
      const result = await this.scansService.create(req.user.id, createScanDto);
      this.logger.log(`Successfully created scan with ID: ${result.id} for user: ${req.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create scan for datasheet ID: ${createScanDto.datasheetId} (User: ${req.user.email})`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to create scan',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request & { user: AuthUser }): Promise<ScanRead[]> {
    this.logger.log(`Fetching scans for user: ${req.user.email}`);
    
    try {
      const result = await this.scansService.findAllForUser(req.user.id);
      this.logger.log(`Successfully fetched ${result.length} scans for user: ${req.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch scans for user: ${req.user.email}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to fetch scans',
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
    @Body() body: { status: string }
  ): Promise<ScanRead> {
    this.logger.log(`Updating status for scan ID: ${id} to: ${body.status}`);
    
    try {
      const result = await this.scansService.updateStatus(id, body.status);
      this.logger.log(`Successfully updated status for scan ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update status for scan ID: ${id}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to update scan status',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/workflow-status')
  async getWorkflowStatus(@Param('id', ParseIntPipe) id: number): Promise<any> {
    this.logger.log(`Getting workflow status for scan ID: ${id}`);
    
    try {
      const result = await this.scansService.getWorkflowStatus(id);
      this.logger.log(`Successfully fetched workflow status for scan ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch workflow status for scan ID: ${id}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to fetch workflow status',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
