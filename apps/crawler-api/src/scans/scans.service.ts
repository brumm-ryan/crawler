import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporalService } from '../temporal/temporal.service';

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
  private readonly logger = new Logger(ScansService.name);

  constructor(
    private prisma: PrismaService,
    private temporalService: TemporalService,
  ) {}

  async create(userId: number, createScanDto: CreateScanDto): Promise<ScanRead> {
    const scan = await this.prisma.scan.create({
      data: {
        userId,
        datasheetId: createScanDto.datasheetId,
        externalId: createScanDto.externalId,
      },
      include: {
        datasheet: true,
      },
    });

    const piiSources = await this.prisma.piiSource.findMany({
      where: {
        isActive: true,
      },
    });

    // Construct crawl tasks from PiiSource records
    const crawlTasks = piiSources.map(source => ({
      activityName: source.activityName,
      piiSourceId: source.id,
      url: source.url,

      data: {
        firstName: scan.datasheet.firstName,
        lastName: scan.datasheet.lastName,
        city: 'Chicago',
        state: 'Illinois',
      }
    }));

    // Trigger the Temporal workflow
    try {
      this.logger.log(`Starting crawl workflow for scan ID: ${scan.id}, datasheet ID: ${scan.datasheetId} with ${crawlTasks.length} tasks`);
      
      const workflowId = await this.temporalService.startWorkflow('crawlWorkflow', [{
        scanId: scan.id,
        crawlTasks: crawlTasks
      }], {
        taskQueue: 'web-queue', // Match your workflow's task queue
        workflowId: `crawl-scan-${scan.id}`,
      });

      // Update scan with workflow ID and set status to running
      await this.prisma.scan.update({
        where: { id: scan.id },
        data: {
          externalId: workflowId,
          status: 'running',
        },
      });

      this.logger.log(`Successfully started workflow ${workflowId} for scan ID: ${scan.id}`);
      
    } catch (error) {
      this.logger.error(`Failed to start workflow for scan ID: ${scan.id}:`, error);
      
      // Update scan status to failed
      await this.prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: 'failed',
        },
      });
      
      throw new Error(`Failed to start crawl workflow: ${error.message}`);
    }

    // Fetch the updated scan with the workflow ID
    const updatedScan = await this.prisma.scan.findUnique({
      where: { id: scan.id },
    });

    return this.mapToScanRead(updatedScan);
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

  async updateStatus(scanId: number, status: string): Promise<ScanRead> {
    this.logger.log(`Updating scan ${scanId} status to: ${status}`);
    
    const scan = await this.prisma.scan.update({
      where: { id: scanId },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return this.mapToScanRead(scan);
  }

  async getWorkflowStatus(scanId: number): Promise<any> {
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
      });

      if (!scan || !scan.externalId) {
        return { status: 'no_workflow' };
      }

      const workflowHandle = await this.temporalService.getWorkflowHandle(scan.externalId);
      
      // Query the workflow status
      try {
        const workflowStatus = await this.temporalService.queryWorkflow(scan.externalId, 'getCrawlStatus');
        return {
          status: 'running',
          workflowId: scan.externalId,
          details: workflowStatus,
        };
      } catch (queryError) {
        // Workflow might be completed or failed
        const description = await workflowHandle.describe();
        return {
          status: description.status.name,
          workflowId: scan.externalId,
          details: description,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to get workflow status for scan ${scanId}:`, error);
      return { status: 'error', error: error.message };
    }
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