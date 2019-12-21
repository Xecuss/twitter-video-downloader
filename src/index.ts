import axios, { AxiosResponse } from 'axios';
import rawFs, { promises as fs, WriteStream } from 'fs';
import { Stream } from 'stream';
import { EventEmitter } from 'events';

const videoApiURL: string = 'https://api.twitter.com/1.1/videos/tweet/config/',
      videoPlayerURL: string = 'https://twitter.com/i/videos/tweet/';

export default class Downloader extends EventEmitter{
    private debugFlag: boolean;

    constructor(debugFlag?: boolean){
        super();
        this.debugFlag = debugFlag || false;
    }

    private async getBearerToken(twitter_id: string): Promise<string | null>{
        let playerResponse: AxiosResponse<string> = await axios.get(`${videoPlayerURL}${twitter_id}`);
        let jsMatchRes = playerResponse.data.match(/src="(.*js)"/);

        if(jsMatchRes != null){
            this.debugFlag && console.log(`jsUrl :${jsMatchRes[1]}`);

            let jsUrl: string = jsMatchRes[1],
                jsResponse: AxiosResponse<string> = await axios.get(jsUrl),
                jsData: string = jsResponse.data,
                tokenMatchRes = jsData.match(/Bearer ([a-zA-Z0-9%-]+)/);

            if(tokenMatchRes != null){
                this.debugFlag && console.log(`token: ${tokenMatchRes[1]}`);
                return tokenMatchRes[1];
            }
            else{
                this.debugFlag && console.error('can`t find token!');
            }
        }
        return null;
    }

    private async getPlayUrl(twitter_id: string, token: string): Promise<string | null>{
        let url = `${videoApiURL}${twitter_id}.json`,
            videoConfigResponse: AxiosResponse = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }),
            videoConfig = videoConfigResponse.data;

        if(videoConfig && videoConfig.track){
            this.debugFlag && console.log(`play url: ${videoConfig.track.playbackUrl}`);
            return videoConfig.track.playbackUrl;
        }

        return null;
    }

    private async downLoadFile(url: string, path: string): Promise<void>{
        let response: AxiosResponse = await axios.get(url, {
            responseType: "stream"
        }),
        downloadStream: Stream = response.data;

        let writeStream: WriteStream = rawFs.createWriteStream(path);
        
        downloadStream.pipe(writeStream);
    }

    public async download(twitterId: string, path: string): Promise<void>{
        let token: string | null = await this.getBearerToken(twitterId);
        if(!token){
            throw new Error('get Bearer Token Fail!');   
        }

        let url: string | null = await this.getPlayUrl(twitterId, token);
        if(!url){
            throw new Error('get video URL Fail!');
        }

        if(url.endsWith(".mp4")){
            await this.downLoadFile(url, `${path}${twitterId}.mp4`);
        }
    }
}