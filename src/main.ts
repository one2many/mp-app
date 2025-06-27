import { invoke } from "@tauri-apps/api/core";
import { scan, Format, requestPermissions, checkPermissions } from '@tauri-apps/plugin-barcode-scanner';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { fetch } from '@tauri-apps/plugin-http';



const scanBtn = document.querySelector<HTMLButtonElement>('#scan-btn');
const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel-btn');
const appContainer = document.querySelector<HTMLElement>('.container');
const scannerUI = document.querySelector<HTMLElement>('#scanner-ui');
const html = document.documentElement;
const resultTextbox = document.getElementById('scan-result');

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
      // resets to empty text
      if (resultTextbox) resultTextbox.textContent = '';


      const url = result.content.replace('/sherpa','/result'); 
      console.log('Scanned:', url);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Client-Origin': 'tauri',
          }
        });
	
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const data = JSON.parse(text);
      
        console.log('Parsed JSON data:', data);
      
        //if (resultTextbox) resultTextbox.textContent = JSON.stringify(data, null, 2);
        if (resultTextbox && data && typeof data === 'object') {
          const listItems = Object.entries(data)
            .map(([key, value]) => `<li style="margin-bottom: 4px;"><strong>${key}</strong>: ${value}</li>`)
            .join('');
        
          resultTextbox.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0; text-align: left;">${listItems}</ul>`;
        }
      } catch (httpErr) {
        console.error('HTTP Request failed:', httpErr);
        if (resultTextbox) resultTextbox.textContent = 'HTTP request failed.';
      }


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
