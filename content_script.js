// content_script

window.trackingReporter = {
  extractData: function(callback) {
    chrome.storage.sync.get(null, function(options) {
      const container = document.querySelector(options.container)
      const elements = container.querySelectorAll(
        `${options.elements}, [${options.attribute}]`
      )
      const store = {
        valid: [],
        missing: [],
      }

      elements.forEach((el, index) => {
        el.setAttribute('data-dometik-id', index)

        element = {
          tag: el.tagName.toLowerCase(),
          id: el.id,
          class: el.classList.value,
          text: el.innerText,
          dometikId: index,
          attrData: '',
        }

        const defaultJson = {}
        options.jsonKeys.split(',').forEach(key => {
          defaultJson[key.trim()] = ''
        })

        const attrData = el.getAttribute(options.attribute)

        if (attrData) {
          try {
            if (options.jsonKeys) {
              element.attrData = Object.assign(
                defaultJson,
                JSON.parse(attrData)
              )
            } else {
              element.attrData = attrData
            }
          } catch (e) {
            element.attrData = attrData
          }

          store.valid.push(element)
          el.setAttribute('data-dometik', 'valid')
        } else {
          if (options.jsonKeys) {
            element.attrData = defaultJson
          }

          store.missing.push(element)
          el.setAttribute('data-dometik', 'missing')
        }
      })

      callback(store)
    })
  },
}

window.trackingReporter.extractData(data => {
  chrome.runtime.sendMessage({
    action: 'extract',
    data,
  })
})
