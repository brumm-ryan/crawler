import * as process from "node:process";

const BrowserServiceConfig = {
    wsUrl: `ws://${process.env.BROWSERLESS}` || 'ws://localhost:3000',
    wsToken: process.env.BROWSERLESS_TOKEN || '6R0W53R135510',
    getUrl() {
        return this.wsUrl + "?token=" + this.wsToken;
    }
}

export default BrowserServiceConfig;