import Downloader from './index';

let targetId: string = '1207958103641034758';

let path: string = "/home/kaiser/website/";

async function main(): Promise<void>{
    let downloader = new Downloader(true);
    await downloader.download(targetId, path);
}
main();