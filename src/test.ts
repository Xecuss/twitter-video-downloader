import { getPlayList, downLoadFile } from './index';

let targetId: string = '1207958103641034758';
let token: string = "AAAAAAAAAAAAAAAAAAAAAIK1zgAAAAAA2tUWuhGZ2JceoId5GwYWU5GspY4%3DUq7gzFoCZs1QfwGoVdvSac3IniczZEYXIcDyumCauIXpcAPorE";

async function main(): Promise<void>{
    let str: string = await getPlayList(targetId, token);
    if(str.endsWith(".mp4")){
        await downLoadFile(str, `/home/kaiser/website/public/${targetId}.mp4`);
    }
}
main();