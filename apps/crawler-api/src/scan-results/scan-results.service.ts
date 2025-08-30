import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateScanResultDto {
  scanId: number;
  url: string;
  status: string;
  data?: any;
  error?: string;
  metadata?: any;
}

export interface ScanResultRead {
  id: number;
  scanId: number;
  url: string;
  status: string;
  data?: any;
  error?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScanResultsService {
  constructor(private prisma: PrismaService) {}

  async create(createScanResultDto: CreateScanResultDto): Promise<ScanResultRead> {
    const scanResult = await this.prisma.scanResult.create({
      data: {
        scanId: createScanResultDto.scanId,
        url: createScanResultDto.url,
        status: createScanResultDto.status,
        data: createScanResultDto.data,
        error: createScanResultDto.error,
        metadata: createScanResultDto.metadata,
      },
    });

    return this.mapToScanResultRead(scanResult);
  }

  async findAllForScan(scanId: number): Promise<ScanResultRead[]> {
    const scanResults = await this.prisma.scanResult.findMany({
      where: {
        scanId: scanId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return scanResults.map(this.mapToScanResultRead);
  }

  async findOne(id: number): Promise<ScanResultRead | null> {
    const scanResult = await this.prisma.scanResult.findUnique({
      where: { id },
    });

    return scanResult ? this.mapToScanResultRead(scanResult) : null;
  }

  async updateStatus(id: number, status: string, error?: string): Promise<ScanResultRead> {
    const scanResult = await this.prisma.scanResult.update({
      where: { id },
      data: {
        status,
        error,
        updatedAt: new Date(),
      },
    });

    return this.mapToScanResultRead(scanResult);
  }

  private mapToScanResultRead(scanResult: any): ScanResultRead {
    return {
      id: scanResult.id,
      scanId: scanResult.scanId,
      url: scanResult.url,
      status: scanResult.status,
      data: scanResult.data,
      error: scanResult.error,
      metadata: scanResult.metadata,
      createdAt: scanResult.createdAt,
      updatedAt: scanResult.updatedAt,
    };
  }
}