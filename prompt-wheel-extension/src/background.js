/* Service worker : relaie le raccourci Chrome vers l'onglet actif et ouvre
   les options à la première installation. */
importScripts('defaults.js', 'store.js');

chrome.runtime.onInstalled.addListener(async (details) => {
  const data = await self.PromptWheelStore.get();
  await self.PromptWheelStore.set(data); // écrit les valeurs par défaut au 1er lancement
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html?welcome=1') });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-wheel') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'toggle-wheel' });
  } catch (e) {
    // Content script absent (page rechargée après l'installation, page interne) :
    // on l'injecte puis on réessaie.
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/defaults.js', 'src/store.js', 'src/insert.js', 'src/wheel.js', 'src/content.js']
      });
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle-wheel' });
    } catch (err) {
      console.warn('[Prompt Wheel] roue indisponible sur cet onglet', err);
    }
  }
});
