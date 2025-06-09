import {DataSheet} from '../../types';

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
    tasks.push({activity: 'runWhitePages', siteId: 3, data: dataSheet})
    return tasks;
}