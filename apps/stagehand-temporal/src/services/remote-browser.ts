import axios from "axios";
import BrowserServiceConfig from "../config/browser-service.config";

export interface RemoteBrowser {
    id: number,
    cdpUrl: string;
}


export async function getBrowser() {
    const remoteBrowser : RemoteBrowser = await axios.post(`${BrowserServiceConfig.url}/browsers`).then(res => {
       return res.data;
    });
    return remoteBrowser;
}

export async function releaseBrowser(remoteBrowser:RemoteBrowser) {
    await axios.delete(`${BrowserServiceConfig.url}/browsers/${remoteBrowser.id}`)
}
