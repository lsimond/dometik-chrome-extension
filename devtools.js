// devtools

chrome.devtools.panels.create(
  'Dometik',
  'icons/icon-48.png',
  'devtools.html',
  function(panel) {}
)

let extensionOptions = {}

chrome.storage.sync.get(null, options => {
  extensionOptions = options
})

const page_getProperties = () => {
  const el = $0 ? $0 : {}
  let attrData = el.getAttribute('__attr__')

  try {
    attrData = JSON.parse(attrData)
  } catch (e) {
    attrData = { data: attrData }
  }

  return {
    __proto__: null,
    ...attrData,
  }
}

chrome.devtools.panels.elements.createSidebarPane('Dometik', sidebar => {
  function updateElementProperties() {
    sidebar.setExpression(
      `(${page_getProperties
        .toString()
        .replace(/(__attr__)/, extensionOptions.attribute)})()`,
      `[${extensionOptions.attribute}]`
    )
  }
  updateElementProperties()
  chrome.devtools.panels.elements.onSelectionChanged.addListener(
    updateElementProperties
  )
})

//Create a port with background page for continous message communication
const port = chrome.runtime.connect({
  name: 'panel-connection',
})

let globalStore = {
  present: [],
  missing: [],
}

// Listen to messages from the background page
port.onMessage.addListener(function({ action, data }) {
  switch (action) {
    case 'extract':
      globalStore = data
      displayResult(data)
      break

    default:
      break
  }
})

const start = getElements('#start', false)
const output = getElements('#output', false)

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if (details.tabId === chrome.devtools.inspectedWindow.tabId) {
    globalStore = {
      valid: [],
      missing: [],
    }
    start.classList.remove('d-none')
    output.innerHTML = ''
    buttonDownload.classList.add('disabled')
    buttonDownload.removeAttribute('download')
  }
})

chrome.storage.onChanged.addListener(function(changes, areaName) {
  chrome.devtools.inspectedWindow.reload()
})

getElements('#options', false).addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open(chrome.runtime.getURL('options.html'))
  }
})

// Execute content script on download button click
const buttonDownload = getElements('#download', false)
buttonDownload.addEventListener('click', function(event) {
  if (!buttonDownload.getAttribute('download')) {
    event.preventDefault()
    downloadReport()
  }
})

// Execute content script on check button click
const buttonCheck = getElements('#check', false)
buttonCheck.addEventListener('click', function() {
  sendMessage('script', 'content_script.js')
  start.classList.add('d-none')
  buttonDownload.classList.remove('disabled')
})

function sendMessage(action, content, callback = () => {}) {
  chrome.runtime.sendMessage(
    {
      tabId: chrome.devtools.inspectedWindow.tabId,
      action,
      content,
    },
    callback()
  )
}

function downloadReport() {
  chrome.devtools.inspectedWindow.eval(
    'window.location',
    (result, exceptionInfo) => {
      let filename = result.hostname + result.pathname
      filename = `${filename.replace(/[./]/, '_')}.csv`

      const filecontent = getFileContent()

      buttonDownload.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(filecontent)}`
      )
      buttonDownload.setAttribute('download', filename)
      buttonDownload.click()
    }
  )
}

function getFileContent() {
  const headings = [
    'tag',
    'id',
    'class',
    'text',
    'valid',
    ...(extensionOptions.jsonKeys
      ? extensionOptions.jsonKeys.split(',').map(k => k.trim())
      : ['data']),
  ]

  let content = `${headings.join(';')};\n`
  content += Object.keys(globalStore)
    .map(key => {
      return globalStore[key]
        .map(el => {
          let obj = Object.assign({}, el, {
            valid: key === 'valid',
          })

          if (typeof el.attrData === 'object') {
            obj = Object.assign(obj, el.attrData)
          } else {
            obj.data = el.attrData
          }

          return `${headings.map(prop => `"${obj[prop]}"`).join(';')};\n`
        })
        .join('')
    })
    .join('')

  return content
}

function displayResult(store) {
  output.innerHTML = createElement('div', { class: 'text-center' }, [
    createElement('div', { class: 'btn-group btn-group-sm mb-3' }, [
      createElement(
        'button',
        {
          class: 'btn btn-success',
          type: 'button',
          dataToggle: 'collapse',
          dataTarget: `#collapse-valid`,
          ariaExpanded: 'false',
          ariaControls: `collapse-valid`,
        },
        [
          createElement('i', { class: 'fas fa-check-circle mr-1' }),
          `${store.valid.length} valid`,
        ]
      ),
      createElement(
        'button',
        {
          class: 'btn btn-danger',
          type: 'button',
          dataToggle: 'collapse',
          dataTarget: `#collapse-missing`,
          ariaExpanded: 'false',
          ariaControls: `collapse-missing`,
        },
        [
          createElement('i', { class: 'fas fa-times-circle mr-1' }),
          `${store.missing.length} missing`,
        ]
      ),
    ]),
    ...Object.keys(store).map(key => {
      return displayData(store[key], key)
    }),
  ]).outerHTML

  bindEvents()
}

function bindEvents() {
  getElements('[data-dometik-id]').forEach(el => {
    const element = `$$('[data-dometik-id="${el.getAttribute(
      'data-dometik-id'
    )}"]')[0]`
    const scrollOpt = '{behavior: "smooth", block: "center", inline: "center"}'
    el.addEventListener('click', () => {
      chrome.devtools.inspectedWindow.eval(
        `${element}.scrollIntoView(${scrollOpt});inspect(${element})`
      )
    })
  })

  getElements('[data-toggle="collapse"]').forEach(el => {
    el.addEventListener('click', () => {
      getElements('[data-toggle="collapse"]').forEach(e => {
        e.classList.remove('active')
      })
      el.classList.add('active')

      getElements('.collapse').forEach(e => {
        e.classList.remove('show')
      })
      getElements(el.getAttribute('data-target'), false).classList.add('show')
    })
  })
}

function displayData(store, key) {
  return createElement(
    'div',
    { id: `collapse-${key}`, class: 'collapse table-responsive' },
    [
      createElement('p', { class: 'lead text-uppercase' }, key),
      createElement(
        'table',
        { class: `table table-dark table-sm table-hover` },
        [
          createElement('thead', { class: 'text-uppercase' }, [
            createElement('tr', {}, [
              createElement('th', {}, 'selector'),
              createElement('th', {}, 'text'),
              ...(extensionOptions.jsonKeys
                ? extensionOptions.jsonKeys
                    .split(',')
                    .map(k => createElement('th', {}, k.trim()))
                : [createElement('th', {}, 'attribute data')]),
            ]),
          ]),
          createElement(
            'tbody',
            {},
            store.map(el => {
              let selector = ''
              selector +=
                el.tag && `<span class="text-warning">${el.tag}</span>`
              selector += el.id && `<span class="text-danger">#${el.id}</span>`
              selector +=
                el.class && !el.id
                  ? `<span class="text-info">.${el.class
                      .split(' ')
                      .join('.')}</span>`
                  : ''

              el.text = el.text.trim()
              el.text =
                el.text.length > 40 ? el.text.substring(0, 40) + '...' : el.text

              return createElement('tr', { dataDometikId: el.dometikId }, [
                createElement('td', {}, selector),
                createElement('td', {}, el.text),
                ...(extensionOptions.jsonKeys
                  ? extensionOptions.jsonKeys
                      .split(',')
                      .map(k => createElement('th', {}, el.attrData[k.trim()]))
                  : [createElement('th', {}, el.attrData)]),
              ])
            })
          ),
        ]
      ),
    ]
  )
}

function getElements(selector, all = true) {
  return all
    ? document.querySelectorAll(selector)
    : document.querySelector(selector)
}

function createElement(tag, attributes = {}, content = []) {
  const el = document.createElement(tag)

  Object.keys(attributes).forEach(key => {
    attr = key.replace(/([A-Z])/g, '-$1')
    el.setAttribute(attr, attributes[key])
  })

  el.innerHTML = Array.isArray(content)
    ? content.map(el => (typeof el === 'string' ? el : el.outerHTML)).join('')
    : content

  return el
}
