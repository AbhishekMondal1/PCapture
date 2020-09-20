// Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;


const {desktopCapture, dialog } = require('electron');

// Video sources 
async function getVideoSources(){
    const inputSources = await desktopCapture.getVideoSources({
        types: ['window', 'screen']
    });

    const videoOptionMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );
        videoOptionMenu.popup();
}


let mediaRecoder; //MediaRecorder instance to capture footage
const recordedChunks = [];


// change videoSource window to record
async function selectSource(source) {

    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };


// create Stream
const stream = await navigator.mediaDevices.getUserMedia(constraints);

// Preview the video element
videoElement.srcObject = stream;
videoElement.play();

// Create media recorder
const options = { mimeType: 'video/webm; codecs=vp9'};
mediaRecoder = new MedoaRecorder(stream,options);

// Register Event Handlers
mediaRecoder.ondataavailable = handleDataAvailable;
mediaRecoder.onstop = handleStop;

}

// capture all recorded chunks
function handleDataAvailable(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}

const { writeFile } = require('fs');

// Save the video file on stop
async function handleStop(e){
    const blob = new Blob(recordedChunks,{
        type:'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({

        buttonLabel: 'Save Video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);

    writeFile(filePath,buffer, ()=> console.log('video saved successfully'));

}
