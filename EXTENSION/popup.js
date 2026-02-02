const apiBaseInput = document.getElementById('apiBase')
const tokenInput = document.getElementById('token')
const titleInput = document.getElementById('title')
const saveButton = document.getElementById('save')
const captureButton = document.getElementById('capture')
const statusEl = document.getElementById('status')

function setStatus(message, isError = false) {
  statusEl.textContent = message
  statusEl.style.color = isError ? '#b00020' : '#2e7d32'
}

function normalizeApiUrl(base) {
  if (!base) return ''
  let normalized = base.trim().replace(/\/+$/, '')
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`
  }
  return `${normalized}/captures/`
}

function loadSettings() {
  chrome.storage.sync.get(['apiBase', 'token'], data => {
    apiBaseInput.value = data.apiBase || ''
    tokenInput.value = data.token || ''
  })
}

saveButton.addEventListener('click', () => {
  chrome.storage.sync.set(
    {
      apiBase: apiBaseInput.value.trim(),
      token: tokenInput.value.trim(),
    },
    () => {
      setStatus('Settings saved')
    }
  )
})

captureButton.addEventListener('click', () => {
  setStatus('Capturing...')
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0]
    if (!tab || !tab.id) {
      setStatus('No active tab found', true)
      return
    }

    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, async response => {
      if (!response || chrome.runtime.lastError) {
        setStatus('Unable to read selection', true)
        return
      }

      const apiUrl = normalizeApiUrl(apiBaseInput.value)
      if (!apiUrl) {
        setStatus('Set API Base URL first', true)
        return
      }

      const payload = {
        source: 'extension',
        title: titleInput.value.trim() || response.title || 'Captured Selection',
        content: response.selection || '',
        source_url: response.url || '',
        raw_data: {
          selection: response.selection || '',
          pageTitle: response.title || '',
        },
      }

      try {
        const headers = { 'Content-Type': 'application/json' }
        if (tokenInput.value.trim()) {
          headers['X-Capture-Token'] = tokenInput.value.trim()
        }

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const text = await res.text()
          setStatus(`Capture failed: ${text}`, true)
          return
        }
        setStatus('Captured successfully')
      } catch (err) {
        setStatus(`Capture error: ${err.message || err}`, true)
      }
    })
  })
})

loadSettings()
