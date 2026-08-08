import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outputDir = '/Users/gabo/.gemini/antigravity/brain/3e79446c-7d21-41e5-ac11-18970f335ef1';

async function recordPage(url, name, scriptFn) {
  const framesDir = path.join(outputDir, 'frames_' + name);
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Pre-seed local storage with realistic mock state
  await page.addInitScript(() => {
    localStorage.setItem('medlock_contract_address', '0x94f1a23b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f');
    localStorage.setItem('medlock_patient_blood_type', 'O+');
    localStorage.setItem('medlock_patient_serology_clean', 'true');
    localStorage.setItem('medlock_patient_consents', JSON.stringify({
      organDonation: true,
      emergencyMatching: true,
      clinicalTrial: false
    }));

    // Inject mock Midnight wallet
    window.midnight = {
      '1am': {
        name: '1AM Wallet (Demo)',
        connect: async () => ({
          getConfiguration: async () => ({
            networkId: 'undeployed',
            indexerUri: 'http://localhost:8088/api/v3/graphql',
            indexerWsUri: 'ws://localhost:8088/api/v3/graphql/ws'
          }),
          getUnshieldedAddress: async () => '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          getShieldedAddresses: async () => ({
            shieldedCoinPublicKey: '0x0000000000000000000000000000000000000000000000000000000000000001',
            shieldedEncryptionPublicKey: '0x0000000000000000000000000000000000000000000000000000000000000001'
          }),
          getProvingProvider: async () => ({ proveTx: async () => ({}) })
        })
      }
    };

    // Add cursor
    window.addEventListener('DOMContentLoaded', () => {
      const c = document.createElement('div');
      c.id = 'agent-cursor';
      c.style.width = '24px';
      c.style.height = '24px';
      c.style.borderRadius = '50%';
      c.style.backgroundColor = 'rgba(0, 122, 255, 0.85)';
      c.style.border = '2px solid #ffffff';
      c.style.boxShadow = '0 0 14px rgba(0,122,255,0.9)';
      c.style.position = 'fixed';
      c.style.pointerEvents = 'none';
      c.style.zIndex = '999999';
      c.style.transition = 'all 0.08s ease-out';
      c.style.top = '0px';
      c.style.left = '0px';
      document.body.appendChild(c);
    });
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  let frameCount = 0;
  async function snap() {
    const fPath = path.join(framesDir, `frame_${String(frameCount++).padStart(4, '0')}.png`);
    await page.screenshot({ path: fPath });
  }

  async function moveMouse(fromX, fromY, toX, toY, steps = 14) {
    for (let i = 0; i <= steps; i++) {
      const cx = fromX + (toX - fromX) * (i / steps);
      const cy = fromY + (toY - fromY) * (i / steps);
      await page.evaluate(({ x, y }) => {
        const el = document.getElementById('agent-cursor');
        if (el) { el.style.left = x + 'px'; el.style.top = y + 'px'; }
      }, { x: cx, y: cy });
      await snap();
    }
  }

  async function clickAt(x, y) {
    await moveMouse(x - 50, y - 30, x, y, 10);
    await page.evaluate(() => {
      const el = document.getElementById('agent-cursor');
      if (el) el.style.transform = 'scale(0.7)';
    });
    for (let i = 0; i < 3; i++) await snap();
    await page.mouse.click(x, y);
    await page.evaluate(() => {
      const el = document.getElementById('agent-cursor');
      if (el) el.style.transform = 'scale(1)';
    });
    for (let i = 0; i < 5; i++) await snap();
  }

  await scriptFn(page, moveMouse, clickAt, snap);

  await browser.close();

  // Convert frame PNGs to WebP using img2webp
  const webpPath = path.join(outputDir, `demo_${name}.webp`);
  const frameFiles = fs.readdirSync(framesDir)
    .filter(f => f.endsWith('.png'))
    .sort()
    .map(f => `"${path.join(framesDir, f)}"`)
    .join(' ');

  execSync(`/opt/homebrew/bin/img2webp -loop 0 -d 110 ${frameFiles} -o "${webpPath}"`);
  console.log(`Generated: ${webpPath}`);
}

(async () => {
  // 1. Record Inicio & Connect Wallet Flow
  await recordPage('http://localhost:5173/', 'inicio', async (page, move, click, snap) => {
    await move(100, 100, 1180, 36, 18);
    await click(1180, 36); // Click "Conectar Wallet"
    for (let i = 0; i < 12; i++) await snap();
    await move(1180, 36, 640, 420, 18);
    for (let i = 0; i < 10; i++) await snap();
  });

  // 2. Record Paciente Full Functional Flow
  await recordPage('http://localhost:5173/patient', 'paciente', async (page, move, click, snap) => {
    // Connect wallet first
    await click(1180, 36);
    for (let i = 0; i < 8; i++) await snap();
    
    // Interact with Blood selector
    await move(1180, 36, 260, 240, 15);
    await click(260, 240);
    for (let i = 0; i < 10; i++) await snap();

    // Toggle Serology switch
    await move(260, 240, 480, 300, 15);
    await click(480, 300);
    for (let i = 0; i < 10; i++) await snap();
  });

  // 3. Record Doctor & Admin Full Functional Flow
  await recordPage('http://localhost:5173/doctor', 'medico', async (page, move, click, snap) => {
    await click(1180, 36);
    for (let i = 0; i < 8; i++) await snap();

    // Click Deploy Contract
    await move(1180, 36, 280, 240, 15);
    await click(280, 240);
    for (let i = 0; i < 10; i++) await snap();

    // Click Authorize Doctor
    await move(280, 240, 520, 240, 15);
    await click(520, 240);
    for (let i = 0; i < 10; i++) await snap();
  });

  // 4. Record Emergencias ZK Scanner Full Functional Flow
  await recordPage('http://localhost:5173/emergency', 'emergencias', async (page, move, click, snap) => {
    await click(1180, 36);
    for (let i = 0; i < 8; i++) await snap();

    // Click Initiate ZK Verification button
    await move(1180, 36, 780, 440, 18);
    await click(780, 440);
    for (let i = 0; i < 15; i++) await snap();
  });
})();
