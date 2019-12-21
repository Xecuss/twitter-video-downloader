import { getPlayList } from './index';

let targetId: string = '1207958103641034758';
let token: string = "AAAAAAAAAAAAAAAAAAAAAIK1zgAAAAAA2tUWuhGZ2JceoId5GwYWU5GspY4%3DUq7gzFoCZs1QfwGoVdvSac3IniczZEYXIcDyumCauIXpcAPorE";

async function main(): Promise<void>{
    await getPlayList(targetId, token);
}
main();