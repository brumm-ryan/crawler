"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var process = require("node:process");
var BrowserServiceConfig = {
    wsUrl: "ws://".concat(process.env.BROWSERLESS) || 'ws://localhost:3000',
    wsToken: process.env.BROWSERLESS_TOKEN || '6R0W53R135510',
    getUrl: function () {
        return this.wsUrl + "?token=" + this.wsToken;
    }
};
exports.default = BrowserServiceConfig;
