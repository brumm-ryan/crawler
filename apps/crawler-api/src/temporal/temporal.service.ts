import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalService.name);
  private client: Client;
  private connection: Connection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const temporalAddress = this.configService.get<string>('TEMPORAL_ADDRESS', 'localhost:7233');
      
      this.connection = await Connection.connect({
        address: temporalAddress,
      });

      this.client = new Client({
        connection: this.connection,
        namespace: this.configService.get<string>('TEMPORAL_NAMESPACE', 'default'),
      });

      this.logger.log(`Connected to Temporal server at ${temporalAddress}`);
    } catch (error) {
      this.logger.error('Failed to connect to Temporal server', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.connection) {
        await this.connection.close();
        this.logger.log('Disconnected from Temporal server');
      }
    } catch (error) {
      this.logger.error('Error closing Temporal connection', error);
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Temporal client not initialized');
    }
    return this.client;
  }

  async startWorkflow<T>(workflowType: string, args: any[], options: {
    taskQueue: string;
    workflowId?: string;
    searchAttributes?: Record<string, any>;
  }): Promise<string> {
    const handle = await this.client.workflow.start(workflowType, {
      args,
      taskQueue: options.taskQueue,
      workflowId: options.workflowId || `${workflowType}-${Date.now()}`,
      searchAttributes: options.searchAttributes,
    });

    return handle.workflowId;
  }

  async getWorkflowHandle(workflowId: string) {
    return this.client.workflow.getHandle(workflowId);
  }

  async signalWorkflow(workflowId: string, signalName: string, ...args: any[]) {
    const handle = await this.getWorkflowHandle(workflowId);
    return handle.signal(signalName, ...args);
  }

  async queryWorkflow(workflowId: string, queryType: string, ...args: any[]) {
    const handle = await this.getWorkflowHandle(workflowId);
    return handle.query(queryType, ...args);
  }
}