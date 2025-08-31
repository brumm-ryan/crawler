import {ActivityTask, DataSheet} from './types';
import {
    defineQuery,
    proxyActivities, setHandler,
} from '@temporalio/workflow';
import {WORKER_QUEUE_NAMES} from "./activities/shared/worker_queue_names";


const crawlActivities = proxyActivities({
    retry: {
        initialInterval: '50 milliseconds',
        maximumAttempts: 1,
    },
    startToCloseTimeout: '10 minutes',
    taskQueue: WORKER_QUEUE_NAMES.WEB_QUEUE,
});

const appActivities = proxyActivities({
    retry: {
        initialInterval: '50 milliseconds',
        maximumAttempts: 10,
    },
    startToCloseTimeout: '1 minutes',
    taskQueue: WORKER_QUEUE_NAMES.APP_QUEUE,
});

export interface CrawlWorkflowParams {
    scanId: number; // Add scanId to track which scan this workflow belongs to
    crawlTasks: ActivityTask[];
}

const getCrawlStatus = defineQuery<{
    tasks: Array<ActivityTask>
    successes: Array<string>;
    failures: Array<string>;
}>("getCrawlStatus");

export async function crawlWorkflow(params: CrawlWorkflowParams): Promise<Record<string, any>> {
    const {scanId, crawlTasks} = params;
    const tasks = crawlTasks;
    const promises: Promise<any>[] = [];
    const results: Record<string, any> = {};
    const errors: Record<string, any> = {};

    setHandler(getCrawlStatus, () => {
        return {
            tasks: tasks,
            successes: Object.keys(results),
            failures: Object.keys(errors),
        };
    });

    for (const task of tasks) {
        try {
            const activity = crawlActivities[task.activityName];
            if (!activity) {
                throw new Error(`Unknown activity: ${task.activityName}`);
            }
            promises.push(
                Promise.resolve(activity(task))
                    .then(async res => {
                        results[task.piiSourceId] = res;
                        return res;
                    }).then(async res => {
                    await appActivities.createScanResult({
                        scanId: scanId,
                        url: res?.url || "",
                        piiSourceId: task.piiSourceId,
                        result: res,
                        metadata: {
                            activity: task.activityName,
                            taskData: task.data,
                        }
                    });
                }).catch(async err => {
                    console.error(`Error executing activity ${task.activityName}:`, err);
                    errors[task.piiSourceId] = err;

                    try {
                        await appActivities.createScanResult({
                            scanId: scanId,
                            url: "",
                            piiSourceId: task.piiSourceId,
                            error: err.message || String(err),
                            metadata: {
                                activity: task.activityName,
                                taskData: task.data,
                            }
                        });
                    } catch (saveError) {
                        console.error(`Failed to save error for ${task.piiSourceId}:`, saveError);
                        // Don't fail the workflow if saving fails
                    }

                    throw err;
                })
            );
        } catch (err) {
            console.error(`Failed to start activity for site ${task.piiSourceId}:`, err);
            errors[task.piiSourceId] = err;
            try {
                await appActivities.createScanResult({
                    scanId: scanId,
                    url: "",
                    piiSourceId: task.piiSourceId,
                    error: `Failed to start activity: ${err.message || String(err)}`,
                    metadata: {
                        activity: task.activityName,
                        taskData: task.data,
                    }
                });
            } catch (saveError) {
                console.error(`Failed to save startup error for ${task.piiSourceId}:`, saveError);
            }
        }
    }

    await Promise.allSettled(promises);

    // Determine final scan status based on results
    const totalTasks = tasks.length;
    const successCount = Object.keys(results).length;
    const errorCount = Object.keys(errors).length;
    
    let finalStatus: string;
    if (errorCount === totalTasks) {
        // All tasks failed
        finalStatus = 'failed';
    } else if (successCount > 0) {
        // At least some tasks succeeded
        finalStatus = 'completed';
    } else {
        // No results but no explicit errors (shouldn't happen)
        finalStatus = 'completed';
    }

    // Update scan status
    try {
        await appActivities.updateScanStatus({
            scanId: scanId,
            status: finalStatus
        });
        console.log(`Scan ${scanId} marked as ${finalStatus}. Results: ${successCount}/${totalTasks} successful, ${errorCount} failed.`);
    } catch (error) {
        console.error(`Failed to update scan ${scanId} status to ${finalStatus}:`, error);
        // Don't fail the workflow if status update fails
    }

    return results;
}

export async function matchWorkflow(dataSheet: DataSheet, crawlResults: Record<string, any>) {
    // todo - run matching and persist results
}