import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DatasheetService } from './datasheet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth.service';
import type { DatasheetCreate, DatasheetRead } from '@crawl-monorepo/shared-contracts';

@Controller('datasheets')
@UseGuards(JwtAuthGuard)
export class DatasheetController {
  private readonly logger = new Logger(DatasheetController.name);

  constructor(private readonly datasheetService: DatasheetService) {}

  @Post()
  async create(
    @Body() createDatasheetDto: DatasheetCreate,
    @Req() req: Request & { user: AuthUser }
  ): Promise<DatasheetRead> {
    this.logger.log(`Creating new datasheet for: ${createDatasheetDto.firstName} ${createDatasheetDto.lastName} (User: ${req.user.email})`);
    this.logger.debug(`Create datasheet payload:`, JSON.stringify(createDatasheetDto, null, 2));
    
    try {
      // Associate the datasheet with the authenticated user
      const datasheetWithUser = {
        ...createDatasheetDto,
        userId: req.user.id,
      };

      const result = await this.datasheetService.create(datasheetWithUser);
      this.logger.log(`Successfully created datasheet with ID: ${result.id} for user: ${req.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create datasheet for ${createDatasheetDto.firstName} ${createDatasheetDto.lastName} (User: ${req.user.email})`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to create datasheet',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request & { user: AuthUser }): Promise<DatasheetRead[]> {
    this.logger.log(`Fetching datasheets for user: ${req.user.email}`);
    
    try {
      const result = await this.datasheetService.findAllForUser(req.user.id);
      this.logger.log(`Successfully fetched ${result.length} datasheets for user: ${req.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch datasheets for user: ${req.user.email}`, error.stack);
      this.logger.error(`Error details:`, error);
      
      throw new HttpException(
        {
          message: 'Failed to fetch datasheets',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DatasheetRead> {
    try {
      const datasheet = await this.datasheetService.findOne(id);
      if (!datasheet) {
        throw new HttpException('Datasheet not found', HttpStatus.NOT_FOUND);
      }
      return datasheet;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch datasheet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDatasheetDto: Partial<DatasheetCreate>,
  ): Promise<DatasheetRead> {
    try {
      return await this.datasheetService.update(id, updateDatasheetDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update datasheet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      await this.datasheetService.remove(id);
      return { message: 'Datasheet deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete datasheet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}