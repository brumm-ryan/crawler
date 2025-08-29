import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateScanDto {
  datasheetId: number;
  externalId?: string;
}

export interface ScanRead {
  id: number;
  externalId?: string;
  status: string;
  userId: number;
  datasheetId: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createScanDto: CreateScanDto): Promise<ScanRead> {
    const scan = await this.prisma.scan.create({
      data: {
        userId,
        datasheetId: createScanDto.datasheetId,
        externalId: createScanDto.externalId,
      },
    });

    return this.mapToScanRead(scan);
  }

  async findAllForUser(userId: number): Promise<ScanRead[]> {
    const scans = await this.prisma.scan.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return scans.map(this.mapToScanRead);
  }

  private mapToScanRead(scan: any): ScanRead {
    return {
      id: scan.id,
      externalId: scan.externalId,
      status: scan.status,
      userId: scan.userId,
      datasheetId: scan.datasheetId,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt,
    };
  }
}