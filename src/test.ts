import { getBearerToken } from './index';

let targetId: string = '1207958103641034758';

async function main(): Promise<void>{
    await getBearerToken(targetId);
}
main();