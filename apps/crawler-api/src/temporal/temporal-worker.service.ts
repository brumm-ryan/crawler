import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, NativeConnection } from '@temporalio/worker';
import { CreateScanResultActivity } from './activities/createScanResult.activity';
import { UpdateScanStatusActivity } from './activities/updateScanStatus.activity';

@Injectable()
export class TemporalWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalWorkerService.name);
  private worker: Worker;
  private connection: NativeConnection;

  constructor(
    private readonly configService: ConfigService,
    private readonly createScanResultActivity: CreateScanResultActivity,
    private readonly updateScanStatusActivity: UpdateScanStatusActivity,
  ) {}

  async onModuleInit() {
    // Skip worker initialization if disabled via environment variable
    try {
      const temporalAddress = this.configService.get<string>('TEMPORAL_ADDRESS', 'localhost:7233');
      
      this.connection = await NativeConnection.connect({
        address: temporalAddress,
      });

      // Create activities object with bound methods
      const activities = {
        createScanResult: this.createScanResultActivity.execute.bind(this.createScanResultActivity),
        updateScanStatus: this.updateScanStatusActivity.execute.bind(this.updateScanStatusActivity),
      };

      this.worker = await Worker.create({
        connection: this.connection,
        namespace: this.configService.get<string>('TEMPORAL_NAMESPACE', 'default'),
        taskQueue: 'app-queue',
        activities,
      });

      this.logger.log('Temporal worker created and ready to process activities');
      
      // Start the worker in the background (non-blocking)
      this.worker.run().catch(error => {
        this.logger.error('Temporal worker encountered an error:', error);
      });
      
      this.logger.log('Temporal worker started in background');
    } catch (error) {
      this.logger.error('Failed to initialize Temporal worker', error);
      this.logger.error('Consider setting DISABLE_TEMPORAL_WORKER=true to run without the worker');
      // Don't throw error to prevent the entire application from failing
      this.logger.warn('Application will continue without Temporal worker capabilities');
    }
  }

  async onModuleDestroy() {
    try {
      if (this.worker) {
        this.worker.shutdown();
        this.logger.log('Temporal worker shutdown');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('Temporal worker connection closed');
      }
    } catch (error) {
      this.logger.error('Error shutting down Temporal worker', error);
    }
  }
}