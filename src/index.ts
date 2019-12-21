import axios, { AxiosResponse } from 'axios';
import fs, { WriteStream } from 'fs';
import { Stream } from 'stream';
import { EventEmitter } from 'events';
import ffmpeg from 'ffmpeg';

const videoApiURL: string = 'https://api.twitter.com/1.1/videos/tweet/config/',
      videoPlayerURL: string = 'https://twitter.com/i/videos/tweet/',
      guestTokenURL: string = "https://api.twitter.com/1.1/guest/activate.json";

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

    private async getPlayUrl(twitter_id: string, token: string, guestToken: string): Promise<string | null>{
        let url = `${videoApiURL}${twitter_id}.json`,
            videoConfigResponse: AxiosResponse = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-guest-token": guestToken
                }
            }),
            videoConfig = videoConfigResponse.data;

        if(videoConfig && videoConfig.track){
            this.debugFlag && console.log(`play url: ${videoConfig.track.playbackUrl}`);
            return videoConfig.track.playbackUrl;
        }

        return null;
    }

    private async downLoadFile(url: string, path: string, guestToken: string): Promise<void>{
        let response: AxiosResponse = await axios.get(url, {
            responseType: "stream",
            headers: {
                "x-guest-token": guestToken
            }
        }),
        downloadStream: Stream = response.data;

        let writeStream: WriteStream = fs.createWriteStream(path);

        downloadStream.pipe(writeStream);
    }

    private async downLoadM3U8(url: string, path: string, guestToken: string): Promise<string>{
        let video = await new ffmpeg(url);
        video.addCommand('-headers', `x-guest-token: ${guestToken}`);
        video.addCommand('-c', `copy`);
        return new Promise((resolve, reject)=>{
            video.save(path, (err, files) => {
                if(err){
                    reject(err);
                }
                resolve(files);
            });
        });
    }

    private async getGuestToken(token: string): Promise<string | null>{
        let guestTokenResponse: AxiosResponse = await axios.post(guestTokenURL, '', {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if(guestTokenResponse.data.guest_token){
            return <string>guestTokenResponse.data.guest_token;
        }
        return null;
    }

    public async download(twitterId: string, path: string): Promise<void>{
        let token: string | null = await this.getBearerToken(twitterId);
        if(!token){
            throw new Error('get Bearer Token Fail!');   
        }

        let guestToken: string | null = await this.getGuestToken(token);
        if(!guestToken){
            throw new Error('get Guest Token Fail!');
        }

        let url: string | null = await this.getPlayUrl(twitterId, token, guestToken);
        if(!url){
            throw new Error('get video URL Fail!');
        }

        try{
            this.debugFlag && console.log('try to download...');
            if(url.indexOf(".mp4") != -1){
                await this.downLoadFile(url, `${path}${twitterId}.mp4`, guestToken);
            }
            else if(url.indexOf(".m3u8") != -1){
                await this.downLoadM3U8(url, `${path}${twitterId}.mp4`, guestToken);
            }
        }
        catch(err){
            this.debugFlag && console.error(`fail: ${err.toString()}`);
        }
    }
}