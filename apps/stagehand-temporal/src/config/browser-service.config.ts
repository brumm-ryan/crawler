import * as process from "node:process";

// Define launch options
const launchArgs = {
    headless: false,
    stealth: true,
    args: ['--window-size=1920,1080', '--force-color-profile=srgb']
};

const queryParams = new URLSearchParams({
    token: '6R0W53R135510',
    timeout: '180000',
    launch: JSON.stringify(launchArgs)
});

const BrowserServiceConfig = {
    wsUrl: `ws://${process.env.BROWSERLESS}` || 'ws://localhost:3000',
    launchArgs: {
        headless: false,
        stealth: true,
        args: ['--window-size=1920,1080', '--force-color-profile=srgb']
    },
    queryParams: new URLSearchParams({
        token: process.env.BROWSERLESS_TOKEN || '6R0W53R135510',
        timeout: '180000',
        launch: JSON.stringify(launchArgs)
    }),

    getUrl() {
        return this.wsUrl + `?${queryParams.toString()}`;
    }
}

export default BrowserServiceConfig;