const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.error(`[BROWSER EXCEPTION] ${err.message}`);
    console.error(err.stack);
  });

  const routes = ['/', '/patient', '/doctor', '/emergency'];
  
  for (const route of routes) {
    try {
      console.log(`\n-------------------------------------`);
      console.log(`Navigating to http://localhost:5173${route}...`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
      const body = await page.innerHTML('body');
      console.log(`Route ${route} loaded. Body HTML length: ${body.length}`);
    } catch (err) {
      console.error(`Failed to load route ${route}:`, err);
    }
  }
  
  await browser.close();
})();
