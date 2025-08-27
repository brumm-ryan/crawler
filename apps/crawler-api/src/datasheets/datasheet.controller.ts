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
} from '@nestjs/common';
import { DatasheetService } from './datasheet.service';
import type { DatasheetCreate, DatasheetRead } from '@crawl-monorepo/shared-contracts';

@Controller('datasheets')
export class DatasheetController {
  private readonly logger = new Logger(DatasheetController.name);

  constructor(private readonly datasheetService: DatasheetService) {}

  @Post()
  async create(@Body() createDatasheetDto: DatasheetCreate): Promise<DatasheetRead> {
    this.logger.log(`Creating new datasheet for: ${createDatasheetDto.firstName} ${createDatasheetDto.lastName}`);
    this.logger.debug(`Create datasheet payload:`, JSON.stringify(createDatasheetDto, null, 2));
    
    try {
      const result = await this.datasheetService.create(createDatasheetDto);
      this.logger.log(`Successfully created datasheet with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create datasheet for ${createDatasheetDto.firstName} ${createDatasheetDto.lastName}`, error.stack);
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
  async findAll(): Promise<DatasheetRead[]> {
    try {
      return await this.datasheetService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch datasheets',
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