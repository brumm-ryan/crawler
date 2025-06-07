import { Client } from '@temporalio/client';
import {crawlWorkflow} from './workflows';

async function run(): Promise<void> {
  const client = new Client();

/*  let result = await client.workflow.execute(crawlWorkflow, {
    taskQueue: 'crawler-queue',
    workflowId: 'crawler-queue',
    args: []
  });
  console.log(result);*/
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
