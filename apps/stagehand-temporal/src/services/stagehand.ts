import {LocalBrowserLaunchOptions, Stagehand} from "@browserbasehq/stagehand";
import StagehandConfig from "../../stagehand.config";
import BrowserServiceConfig from "../config/browser-service.config";

export async function getStagehand() {


    const browserOptions: LocalBrowserLaunchOptions = {
        ...StagehandConfig.localBrowserLaunchOptions,
        cdpUrl: BrowserServiceConfig.getUrl(),
    };

    const stagehand = new Stagehand({
        ...StagehandConfig,
        localBrowserLaunchOptions: browserOptions
    });

    await stagehand.init();

    return stagehand;
}