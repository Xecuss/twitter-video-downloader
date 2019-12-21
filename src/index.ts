import axios, { AxiosResponse } from 'axios';
import rawFs, { promises as fs, WriteStream } from 'fs';
import { Stream } from 'stream';

const videoApiURL: string = 'https://api.twitter.com/1.1/videos/tweet/config/',
      videoPlayerURL: string = 'https://twitter.com/i/videos/tweet/';

export async function getBearerToken(twitter_id: string): Promise<string>{
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

export async function getPlayList(twitter_id: string, token: string): Promise<string>{
    let url = `${videoApiURL}${twitter_id}.json`,
        videoConfigResponse: AxiosResponse = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }),
        videoConfig = videoConfigResponse.data;
    if(videoConfig && videoConfig.track){
        return videoConfig.track.playbackUrl;
    }
    return '';
}

export async function downLoadFile(url: string, path: string): Promise<void>{
    let response: AxiosResponse = await axios.get(url, {
        responseType: "stream"
    }),
    downloadStream: Stream = response.data;
    let writeStream: WriteStream = rawFs.createWriteStream(path);
    downloadStream.pipe(writeStream);
}