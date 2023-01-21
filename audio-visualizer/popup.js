/**
 * @type {HTMLCanvasElement}
 */
const cvs = document.getElementById("canvas")
const ctx = cvs.getContext("2d")
let lastMills = 0
let runAfterMills = 0
let SIZE = 30
let PSIZE = 10
let MAX_PARTICLES = 14
let OUTER_SIZE = 90

/**@type {"white" | "black"} */
let THEME = "black"
let REVERSE_THEME = THEME === "black" ? "white" : "black"
/**@type {"white" | "black"} */
let COLOR = THEME === "black" ? "white" : "black"
document.body.style.backgroundColor = THEME

function changeTheme(/**@type {"white" | "black"} */ newTheme) {
    THEME = newTheme
    COLOR = THEME === "black" ? "white" : "black"
    REVERSE_THEME = THEME === "black" ? "white" : "black"
    document.body.style.backgroundColor = THEME
}

let audioCtx = new AudioContext()
let analyser = audioCtx.createAnalyser()

// capture tab audio
chrome.tabCapture.capture({audio: true, video: false}, stream => {  
    let source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)
    analyser.connect(audioCtx.destination)

    // start drawing
    draw()
})

// Toggle dark and light theme
const changeThemeInput = document.getElementById("theme")

changeThemeInput.addEventListener("change", e => {
    if (THEME === "white") changeTheme("black")
    else changeTheme("white")
})


// Generates a line of particles for every angle based on frequency
function generateAlignedParticles(cos, sin, initX, initY, frequency) {
    let numbeOfParts = Math.floor(frequency * MAX_PARTICLES / OUTER_SIZE) + 1
    let distance = 5
    for (let i = 1; i <= numbeOfParts; i++) {
        let x = (cos * i * 2.5) * distance;
        let y = (sin * i * 2.5) * distance;

        let hue = (150 / i * numbeOfParts) + 105 
        let color = `hsl(${hue}, 85%, 50%)`

        if (THEME !== "black") {
            color = `hsl(${hue}, 90%, 30%)`
        }

        ctx.beginPath()
        ctx.lineWidth = 1.2
        if (i % 2 === 0) {
        ctx.fillStyle = color
        } else {
        ctx.strokeStyle = color;
        }
        let size = PSIZE * (i/SIZE)

        ctx.arc(Math.floor(initX + x), Math.floor(initY + y), size, 0, 2 * Math.PI); 
        i % 2 === 0 && ctx.fill(); 
        i % 2 === 1 && ctx.stroke();
        ctx.closePath()
    }
}

// canvas drawing
function draw(currentMills) {
    analyser.fftSize = 256
    let dataArray = new Uint8Array(analyser.frequencyBinCount)

    analyser.getByteFrequencyData(dataArray)
    let ch = cvs.height
    let cw = cvs.width
    let w = cw / dataArray.length

    if (COLOR === "black") {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, cw, ch)
    } else {
        ctx.clearRect(0, 0, cw, ch)
    }


    // handle cancelling
    let diff = currentMills - lastMills;
    let skipFrame = diff < runAfterMills;
    if (skipFrame) {
        return requestAnimationFrame(draw)
    } else {
        lastMills = currentMills
    }

    // handle canvas drawing

    const drawHalfCirle = (dir = -1) => {

        let initX = (cw / 2)
        let initY = (ch / 2)
        let startAngle = (Math.PI / 2)
        let startX = (initX) + (Math.cos(startAngle) * SIZE)
        let startY = (initY) + (Math.sin(startAngle) * SIZE)
        ctx.moveTo(startX, startY)

        for (let i = 0; i < dataArray.length; i+=3) {
            const f = dataArray[i];
            let angle = dir * i * (
                (Math.PI) / (dataArray.length)
            ) - startAngle

            let cos = Math.cos(angle)
            let sin = Math.sin(angle)

            let initPX = (initX) + (cos * SIZE)
            let initPY = (initY) + (sin * SIZE)

            let freq = ((f * OUTER_SIZE) / 255)

            generateAlignedParticles(cos, sin, initPX, initPY, freq)
        }

    }

    drawHalfCirle(1)
    drawHalfCirle()

    ctx.beginPath()
    ctx.lineCap = "round"
    ctx.lineWidth = 5
    ctx.fillStyle = REVERSE_THEME
    ctx.arc(cw / 2, ch / 2, SIZE * 2 / 3, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()

    requestAnimationFrame(draw)
}

