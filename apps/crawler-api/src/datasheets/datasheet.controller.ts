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
} from '@nestjs/common';
import { DatasheetService } from './datasheet.service';
import type { DatasheetCreate, DatasheetRead } from '@crawl-monorepo/shared-contracts';

@Controller('datasheets')
export class DatasheetController {
  constructor(private readonly datasheetService: DatasheetService) {}

  @Post()
  async create(@Body() createDatasheetDto: DatasheetCreate): Promise<DatasheetRead> {
    try {
      return await this.datasheetService.create(createDatasheetDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create datasheet',
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