import {DataSheet} from '../../types';
import {getBrowser, releaseBrowser, RemoteBrowser} from "../../../services/remote-browser";

export interface ActivityTask {
    activity: string, // Name of the activity to execute
    siteId: number,
    data: DataSheet;
}

export async function getCrawlTasks(dataSheet: DataSheet) {
    const tasks: ActivityTask[] = [];
    // TODO add more logic based on external config
    tasks.push({activity: 'runSmartBackgroundCheck', siteId: 1, data: dataSheet});
    tasks.push({activity: 'runPeopleWhiz', siteId: 2, data: dataSheet});
    return tasks;
}

export async function getInstance() {
    return await getBrowser()
}

export async function releaseInstance(remoteBrowser:RemoteBrowser) {
    await releaseBrowser(remoteBrowser)
}
