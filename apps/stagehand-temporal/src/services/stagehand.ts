import {LocalBrowserLaunchOptions, Stagehand} from "@browserbasehq/stagehand";
import StagehandConfig from "../../stagehand.config";

export async function getStagehand(cdpUrl: string) {

    const browserOptions: LocalBrowserLaunchOptions = {
        ...StagehandConfig.localBrowserLaunchOptions,
        cdpUrl: cdpUrl
    };

    const stagehand = new Stagehand({
        ...StagehandConfig,
        localBrowserLaunchOptions: browserOptions
    });

    await stagehand.init();

    return stagehand;
}