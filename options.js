// options

// Reset form with default options
function resetOptions() {
  // Use default values
  chrome.storage.sync.get('defaultOptions', function({ defaultOptions }) {
    Object.keys(defaultOptions).forEach(key => {
      document.getElementById(key).value = defaultOptions[key]
    })
  })
}

// Saves options to chrome.storage
function saveOptions(event) {
  event.preventDefault()

  const savedOptions = {}

  Object.keys({
    container,
    elements,
    attribute,
    jsonKeys,
  }).forEach(option => {
    savedOptions[option] = document.getElementById(option).value
  })

  chrome.storage.sync.set(savedOptions, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status')
    status.textContent = 'Options saved!'
    setTimeout(() => {
      status.textContent = ''
    }, 750)
  })
}

// Restores input value state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default values
  chrome.storage.sync.get(null, function({
    container,
    elements,
    attribute,
    jsonKeys,
  }) {
    options = { container, elements, attribute, jsonKeys }
    Object.keys(options).forEach(key => {
      document.getElementById(key).value = options[key]
    })
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('form').addEventListener('submit', saveOptions)
document.getElementById('reset').addEventListener('click', resetOptions)
