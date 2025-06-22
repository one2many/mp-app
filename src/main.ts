import { invoke } from "@tauri-apps/api/core";
import { scan, Format, requestPermissions, checkPermissions } from '@tauri-apps/plugin-barcode-scanner';
import { exit, relaunch } from '@tauri-apps/plugin-process'



const scanBtn = document.querySelector<HTMLButtonElement>('#scan-btn');
const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel-btn');
const appContainer = document.querySelector<HTMLElement>('.container');
const scannerUI = document.querySelector<HTMLElement>('#scanner-ui');
const html = document.documentElement;
const resultParagraph = document.getElementById('scan-result');

const showScannerUI = () => {
  if (html) html.classList.add('scanning');
  if (appContainer) appContainer.classList.add('hidden');
  if (scannerUI) scannerUI.classList.remove('hidden');
};

const hideScannerUI = () => {
  if (appContainer) appContainer.classList.remove('hidden');
  if (scannerUI) scannerUI.classList.add('hidden');
  if (html) html.classList.remove('scanning');
  document.body.offsetHeight; // Force reflow
};


scanBtn?.addEventListener('click', async () => {
  showScannerUI();

  try {
    const permission = await checkPermissions();
    if (permission !== 'granted') {
      const granted = await requestPermissions();
      if (granted !== 'granted') {
        console.error('Camera permission not granted');
        hideScannerUI();
        return;
      }
    }

    const result = await scan({
      windowed: true,
      formats: [Format.QRCode],
    });

    if (result !== null) {
      if (resultParagraph) resultParagraph.textContent = '';
      console.log('Scanned:', JSON.stringify(result, null, 2));
      const resultText = result.rawValue ?? JSON.stringify(result);
      if (resultParagraph) resultParagraph.textContent = `Scanned: ${resultText}`;
    } else {
      console.log('No QR code scanned.');
    }
  } catch (err) {
    console.error('Scanning failed:', err);
  } finally {
    hideScannerUI();
  }

});

cancelBtn?.addEventListener('click', async () => {
  hideScannerUI();
});
