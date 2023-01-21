// elements
const startBtn = document.getElementById("start")
const pauseBtn = document.getElementById("pause")
const stopBtn = document.getElementById("stop")
const downloadBtn = document.getElementById("download")
const statusEl = document.getElementById("status")

// console.log()
const audioCtx = new AudioContext()
const audioData = []

let TAB_ID = 0
let START = 0
let DURATION = 0
let FULL_SONG_NAME = null

// navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(stream => {
//     console.log("stream", stream)
// })

function handleCapture(streamId) {
    const options = {
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId
            }
        }
    }

    navigator.mediaDevices.getUserMedia(options).then((stream) => {

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(audioCtx.destination)

        const recorder = new MediaRecorder(source.mediaStream, { mimeType: "video/webm; codecs=vp9" })

        function startRecord(e) {
            statusEl.innerHTML = "active..."
            disableBtn("start")
            enableBtn("pause")
            enableBtn("stop")
            disableBtn("download")
        }


        recorder.addEventListener("start", startRecord)
        recorder.addEventListener("pause", e => {
            statusEl.innerHTML = "paused..."
            pauseBtn.innerHTML = "Resume"
        })

        recorder.addEventListener("resume", e => {
            statusEl.innerHTML = "active..."
            pauseBtn.innerHTML = "Pause"
        })

        recorder.addEventListener("stop", e => {
            statusEl.innerHTML = "stopped..."

            enableBtn("start")
            disableBtn("pause")
            disableBtn("stop")
            enableBtn("download")

        })

        recorder.addEventListener("dataavailable", e => {
            console.log("data-available");
            audioData.push(e.data)
        })

        recorder.addEventListener("error", e => {
            statusEl.innerHTML = "something went wrong..."
        })

        startBtn.addEventListener("click", e => {
            if (recorder.state === "inactive") {
                recorder.start()
            }
        })

        pauseBtn.addEventListener("click", e => {
            if (recorder.state === "paused") {
                recorder.resume()
            } else if (recorder.state === "recording") {
                recorder.pause()
            }
        })

        stopBtn.addEventListener("click", e => {
            if (recorder.state !== "inactive") {
                recorder.stop()
            }
        })

        downloadBtn.addEventListener("click", async e => {
            download();
        })
    });

}

// chrome.tabs.query({
//     currentWindow: true,
//     url: "https://open.spotify.com/*"
// }, (tabs) => {
//     const tab = tabs[0];

//     chrome.tabCapture.capture({ audio: true, video: false }, stream => {
//         const source = audioCtx.createMediaStreamSource(stream)
//         source.connect(audioCtx.destination)

//         const recorder = new MediaRecorder(source.mediaStream, { mimeType: "video/webm; codecs=vp9" })

//         function startRecord(e) {
//             statusEl.innerHTML = "active..."
//             disableBtn("start")
//             enableBtn("pause")
//             enableBtn("stop")
//             disableBtn("download")
//         }


//         recorder.addEventListener("start", startRecord)
//         recorder.addEventListener("pause", e => {
//             statusEl.innerHTML = "paused..."
//             pauseBtn.innerHTML = "Resume"
//         })

//         recorder.addEventListener("resume", e => {
//             statusEl.innerHTML = "active..."
//             pauseBtn.innerHTML = "Pause"
//         })

//         recorder.addEventListener("stop", e => {
//             statusEl.innerHTML = "stopped..."

//             enableBtn("start")
//             disableBtn("pause")
//             disableBtn("stop")
//             enableBtn("download")

//         })

//         recorder.addEventListener("dataavailable", e => {
//             console.log("data-available");
//             audioData.push(e.data)
//         })

//         recorder.addEventListener("error", e => {
//             statusEl.innerHTML = "something went wrong..."
//         })

//         startBtn.addEventListener("click", e => {
//             if (recorder.state === "inactive") {
//                 recorder.start()
//             }
//         })

//         pauseBtn.addEventListener("click", e => {
//             if (recorder.state === "paused") {
//                 recorder.resume()
//             } else if (recorder.state === "recording") {
//                 recorder.pause()
//             }
//         })

//         stopBtn.addEventListener("click", e => {
//             if (recorder.state !== "inactive") {
//                 recorder.stop()
//             }
//         })

//         downloadBtn.addEventListener("click", async e => {
//             download();
//         })
//     })
// });

function disableBtn(id) {
    let btn = document.getElementById(id)
    btn.setAttribute("disabled", "true")
}

function enableBtn(id) {
    let btn = document.getElementById(id)
    btn.removeAttribute("disabled")
}

function download() {
    const blob = new Blob(audioData, {
        type: "video/webm"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = FULL_SONG_NAME ?? Math.random() * 1000 + ".webm";
    a.click();
    window.URL.revokeObjectURL(url);
}


function sendMessage(msg) {
    chrome.tabs.query({ url: "https://open.spotify.com/*", currentWindow: true }, tabs => {
        const [tab] = tabs;
        chrome.tabs.sendMessage(tab.id, msg).then(handleMessage)
    })
}

sendMessage({ message: "start" })


function handleMessage(msg, sender) {
    console.log(msg)
    switch (msg.message) {
        case "start":
            console.log('STARTED - READY')
            startBtn.addEventListener("click", e => {
                START = Date.now()
                console.log("INIT RECORD, ", { START })
                sendMessage({ message: "record" })
            })

            break;
        case "recording":
            console.log('RECORDING:  ', { START: Date.now() - START })
            sendMessage({ message: "duration" })
            DURATION = (msg.duration)
            // get full song name
            FULL_SONG_NAME = msg.fullSongName?.length ? msg.fullSongName : null
            console.log({ DURATION })
            setTimeout(() => stopBtn.click(), DURATION)
        case "streamId":
            console.log({ streamId: msg?.streamId })
        default:
            console.log("UNKNOWN MESSAGE xD")
            break;
    }
}

chrome.runtime.onMessage.addListener(handleMessage)
