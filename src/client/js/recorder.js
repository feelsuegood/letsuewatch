import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

// global let
let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => console.log(message));
  await ffmpeg.load();
  await ffmpeg.writeFile('recording.webm', await fetchFile(videoFile));
  await ffmpeg.exec(['-i', 'recording.webm', '-r', '60', 'output.mp4']);
  const mp4File = await ffmpeg.readFile('output.mp4');
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const mp4Url = URL.createObjectURL(mp4Blob);

  const a = document.createElement('a');
  a.href = mp4Url;
  a.download = 'MyRecording.mp4';
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = 'Download recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};
const handleStart = () => {
  startBtn.innerText = 'Stop recording';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);

  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    // saved in browser memory not hosted by server
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
