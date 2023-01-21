let duration = "0:00"


chrome.tabs.query({ url: "https://open.spotify.com/*", currentWindow: true }, tabs => {
  const tab = tabs[0]

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['script.js']
  });

})

chrome.runtime.onMessage.addListener(handleMessage)
function handleMessage(msg, sender, reply) {
  console.log(msg)
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("External Message:", message, sender, sendResponse)
})
