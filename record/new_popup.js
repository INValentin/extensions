const startBtn = document.getElementById("start")
let NEW_TAB = null


chrome.tabs.create({ url: './home.html',active: false }, newTab => {
    NEW_TAB = newTab

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        const [mainTab] = tabs

        try {
            console.log(newTab)
            chrome.tabCapture.getMediaStreamId({ targetTabId: mainTab.id }, function (streamId) {
                console.log("HERE: ", { streamId })
                chrome.tabs.sendMessage(mainTab.id, { message: "streamId", streamId })
                chrome.tabs.sendMessage(newTab.id, { message: "streamId", streamId })
            })

        } catch (err) {
            console.log({ err })
        }
    })

})