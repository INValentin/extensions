const durationEL = document.querySelector('[data-testid="playback-duration"]')
const playBtn = document.querySelector('[data-testid="control-button-playpause"]')

const playing = () =>  playBtn.getAttribute('aria-label') !== 'Play'

const duration = () => {
  [mins, secs] = durationEL.innerText.trim().split(":").map(el => parseInt(el))
  return (mins * 60 * 1000) + (secs * 1000)
}

const fullSongName = () => {
  const songName = document.querySelector('[data-testid="context-item-link"]').innerText.trim()
  const artistName = document.querySelector('[data-testid="context-item-info-subtitles"]').innerText.trim()
  return `${songName} (${artistName})`
}

const html = `
<div>
  <button>Record</button>
  <button>Stop Recording</button>
</div>
`

const element = document.createElement("div")
element.setAttribute("style", "display: flex;position: fixed;top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px;min-height: 200px; border-radius: 10px;gap: 10px; justify-content: center;z-index: 999999999999999; align-items: center; padding: 10px; background: white;")


element.innerHTML = html;
element.id = "recoder-element"
element.onclick = () => element.style.display = "none"

function showElement() {
  if (document.querySelector(element.id)) {
    element.style.display = "flex"
  } else {
    document.body.prepend(element)
  }
}

chrome.runtime.onMessage.addListener(handleMessage)

function handleMessage(msg, sender, reply) {
  switch (msg?.message) {
    case "start":
      console.log("STARTED CONNECTED")
      reply({ message: "start" })
      break;
    case "record":
      if (!playing()) {
        playBtn.click()
      }
      console.log("START PLAYING - TO RECORD:", fullSongName())
      reply({
        message: "recording",
        duration: duration(),
        fullSongName: fullSongName()
      })
      break;
    default:
      console.log("UNKNOWN MESSAGE: ", msg)
      break;
  }

}

