import {NativeConnection, Worker} from '@temporalio/worker';
import * as activities from './activities';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getRedisClient, closeRedisConnection } from '../services/redis';
import {WORKER_QUEUE_NAMES} from "./activities/shared/worker_queue_names";

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  // Initialize Redis client
  console.log('Initializing Redis client...');
  getRedisClient();

  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS,
  });

  const workers: Worker[] = [];

  for (let j = 0; j < parseInt(process.env.WEB_QUEUE_WORKER_COUNT, 10); j++) {
    const worker = await Worker.create({
      identity: `worker-${WORKER_QUEUE_NAMES.WEB_QUEUE}-${j}`,
      workflowsPath: resolve(__dirname, './workflows.ts'),
      activities,
      taskQueue: WORKER_QUEUE_NAMES.WEB_QUEUE,
      connection
    });
    workers.push(worker);
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down workers...');
    // Shutdown all workers
    await Promise.all(workers.map(worker => worker.shutdown()));
    console.log('Draining Stagehand pool...');

    // Close Redis connection
    console.log('Closing Redis connection...');
    await closeRedisConnection();

    console.log('Shutdown complete');
    process.exit(0);
  };

  // Listen for termination signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Run all workers
  await Promise.all(workers.map(worker => worker.run()));
}

run().catch(async (err) => {
  console.error(err);
  // Ensure pool is drained even on error
  process.exit(1);
});