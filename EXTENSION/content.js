chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'GET_SELECTION') {
    const selection = window.getSelection ? window.getSelection().toString() : ''
    sendResponse({
      selection,
      title: document.title,
      url: window.location.href,
    })
    return true
  }
  return false
})
