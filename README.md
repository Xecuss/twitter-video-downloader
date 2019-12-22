# twitter-video-downloader

This is the Typescript implementation of [h4ckninja/twitter-video-downloader](https://github.com/h4ckninja/twitter-video-downloader).

## Installation

```shell
npm install xecus-twitter-video --save
```

This project uses ffmpeg to download M3U8 files, so you should ensure that ffmpeg has been installed.

## usage

```typescript
import Downloader from 'xecus-twitter-video';

let debugFlag: boolean = true;

let downloader: Downloader = new Downloader(debugFlag);

downloader.download('twitterID here', 'path Here');
```

It will return a Promise, so you can use .then() or async/await to handle the downloaded file.

```typescript
let filename: string = await downloader.download('1207958103641034758', '/home/xecus/video/');
```