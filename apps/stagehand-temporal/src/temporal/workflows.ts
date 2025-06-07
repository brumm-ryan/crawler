import {DataSheet} from './types';
import {
    defineQuery,
    proxyActivities, setHandler, sleep,
} from '@temporalio/workflow';
import {ActivityTask} from "./activities/shared/get-crawl-tasks";


const activities = proxyActivities({
    retry: {
        initialInterval: '50 milliseconds',
        maximumAttempts: 3,
    },
    startToCloseTimeout: '10 minutes'
});

const getCrawlStatus = defineQuery<{
    tasks: Array<ActivityTask>
    successes: Array<string>;
    failures: Array<string>;
}>("getCrawlStatus");

export async function crawlWorkflow(dataSheet: DataSheet): Promise<Record<string, any>> {
    const tasks = await activities.getCrawlTasks(dataSheet);
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

    const browser = await activities.getInstance();

    for (const task of tasks) {
        try {
            const activityName = task.activity
            promises.push(
                Promise.resolve(activities[activityName](task.data, browser.cdpUrl))
                    .then(res => {
                        results[task.siteId] = res;
                        return res;
                    })
                    .catch(err => {
                        console.error(`Error executing activity ${activityName}:`, err);
                        errors[task.siteId] = err;
                        throw err;
                    })
            );
        } catch (err) {
            console.error(`Failed to start activity for site ${task.siteId}:`, err);
            errors[task.siteId] = err;
        }
    }

    await Promise.allSettled(promises);

    await activities.releaseInstance(browser);

    return results;
}

export async function matchWorkflow(dataSheet: DataSheet, crawlResults: Record<string, any>) {
    // todo - run matching and persist results
}