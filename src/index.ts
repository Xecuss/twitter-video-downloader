import axios, { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';

const videoApiURL: string = 'https://api.twitter.com/1.1/videos/tweet/config/',
      videoPlayerURL: string = 'https://twitter.com/i/videos/tweet/';

export async function getBearerToken(twitter_id: string): Promise<string>{
    let url: string = `${videoApiURL}${twitter_id}.json`;
    let playerResponse: AxiosResponse<string> = await axios.get(`${videoPlayerURL}${twitter_id}`);
    let jsMatchRes = playerResponse.data.match(/src="(.*js)"/);
    if(jsMatchRes != null){
        console.log(`jsUrl :${jsMatchRes[1]}`);
        let jsUrl: string = jsMatchRes[1],
            jsResponse: AxiosResponse<string> = await axios.get(jsUrl),
            jsData: string = jsResponse.data;
        await fs.writeFile('./jsdata.js', jsData);
        let tokenMatchRes = jsData.match(/Bearer ([a-zA-Z0-9%-]+)/);
        if(tokenMatchRes != null){
            console.log(`token: ${tokenMatchRes[1]}`);
            return tokenMatchRes[1];
        }
        else{
            console.error('can`t find token!');
        }
    }
    return '';
}