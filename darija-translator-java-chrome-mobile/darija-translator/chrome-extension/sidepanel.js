const $ = (id) => document.getElementById(id);
const defaults = { baseUrl: 'http://localhost:8080/darija-translator/api', username: 'translator', password: 'ChangeMe123!' };
let settings = { ...defaults };
function status(message) { $('status').textContent = message; }
async function loadSettings() {
  const stored = await chrome.storage.local.get(['settings']);
  settings = { ...defaults, ...(stored.settings || {}) };
  $('baseUrl').value = settings.baseUrl; $('username').value = settings.username; $('password').value = settings.password;
}
async function translate() {
  const text = $('source').value.trim();
  if (!text) return status('Select or enter some text first.');
  $('translate').disabled = true; status('Translating…'); $('result').textContent = '';
  try {
    const auth = btoa(unescape(encodeURIComponent(`${settings.username}:${settings.password}`)));
    const response = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/translator/translate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }, body: JSON.stringify({ text })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}. Check server, credentials and API key.`);
    $('result').textContent = data.translation || 'No translation returned.'; status('Translation complete.');
  } catch (error) { $('result').textContent = ''; status(error.message || 'Could not connect to translator.'); }
  finally { $('translate').disabled = false; }
}
$('translate').addEventListener('click', translate);
$('save').addEventListener('click', async () => { settings = { baseUrl: $('baseUrl').value.trim(), username: $('username').value, password: $('password').value }; await chrome.storage.local.set({ settings }); status('Settings saved.'); });
$('copy').addEventListener('click', async () => { const value = $('result').textContent; if (value && value !== 'Your translation will appear here.') { await navigator.clipboard.writeText(value); status('Translation copied.'); } });
$('speak').addEventListener('click', () => { const value = $('result').textContent; if (!value || value.startsWith('Your translation')) return; speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(value)); });
$('paste').addEventListener('click', async () => { try { $('source').value = await navigator.clipboard.readText(); status('Clipboard pasted.'); } catch { status('Clipboard permission was not granted.'); } });
(async () => { await loadSettings(); const { selectedText } = await chrome.storage.session.get(['selectedText']); if (selectedText) { $('source').value = selectedText; await chrome.storage.session.remove('selectedText'); translate(); } })();
