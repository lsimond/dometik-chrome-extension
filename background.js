// background

// Set default extension options
chrome.runtime.onInstalled.addListener(function(details) {
  chrome.storage.sync.set({
    container: 'body',
    elements: 'a, button, form, [data-lf-tracking]',
    attribute: 'data-lf-tracking',
    jsonKeys: 'bind, action, category, label',
    defaultOptions: {
      container: 'body',
      elements: 'a, button, form, [data-lf-tracking]',
      attribute: 'data-lf-tracking',
      jsonKeys: 'bind, action, category, label',
    },
  })
})

// Create a message listener
chrome.runtime.onConnect.addListener(function(port) {
  const extensionListener = function(message, sender, sendResponse) {
    if (message.tabId && message.content) {
      //Evaluate script in inspectedPage
      if (message.action === 'code') {
        chrome.tabs.executeScript(message.tabId, { code: message.content })

        //Attach script to inspectedPage
      } else if (message.action === 'script') {
        chrome.tabs.executeScript(message.tabId, { file: message.content })

        //Pass message to inspectedPage
      } else {
        chrome.tabs.sendMessage(message.tabId, message, sendResponse)
      }

      // This accepts messages from the inspectedPage and sends them to the panel
    } else {
      port.postMessage(message)
    }
    sendResponse(message)
  }

  // Listens to messages sent from the panel
  chrome.runtime.onMessage.addListener(extensionListener)

  port.onDisconnect.addListener(function(port) {
    chrome.runtime.onMessage.removeListener(extensionListener)
  })
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  return true
})
