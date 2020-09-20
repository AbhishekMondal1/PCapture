const {desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const {dialog, Menu } = remote;

let mediaRecoder; //MediaRecorder instance to capture footage
const recordedChunks = [];


// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e =>{
    mediaRecoder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = e => {
    mediaRecoder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;




// Video sources 
async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
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

    if(filePath){
    writeFile(filePath,buffer, ()=> console.log('video saved successfully'));
    }
}