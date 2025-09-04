import puppeteer from 'puppeteer';

const APP_URL = process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173'; // Preview port in CI, dev port locally

async function runTests() {
  console.log('🧪 Starting Puppeteer Tests...\n');
  
  let browser;
  let passed = 0;
  let failed = 0;
  
  try {
    const puppeteerArgs = process.env.PUPPETEER_ARGS ? 
      process.env.PUPPETEER_ARGS.split(' ') : 
      ['--no-sandbox', '--disable-setuid-sandbox'];
      
    browser = await puppeteer.launch({
      headless: true,
      args: puppeteerArgs
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 1: Check if app redirects to login
    console.log('Test 1: Checking redirect to login for unauthenticated users...');
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 10000 });
      const url = page.url();
      
      if (url.includes('/login')) {
        console.log('✅ Test 1 Passed: Redirects to login page\n');
        passed++;
      } else {
        console.log('❌ Test 1 Failed: Did not redirect to login\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test 1 Failed: ${error.message}\n`);
      failed++;
    }
    
    // Test 2: Check login page structure
    console.log('Test 2: Checking login page structure...');
    try {
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      const hasEmail = await page.$('input[type="email"]') !== null;
      const hasPassword = await page.$('input[type="password"]') !== null;
      const hasSubmit = await page.$('button[type="submit"]') !== null;
      
      if (hasEmail && hasPassword && hasSubmit) {
        console.log('✅ Test 2 Passed: Login form has all required fields\n');
        passed++;
      } else {
        console.log('❌ Test 2 Failed: Missing form fields\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test 2 Failed: ${error.message}\n`);
      failed++;
    }
    
    // Test 3: Check Sign In/Sign Up toggle
    console.log('Test 3: Checking Sign In/Sign Up toggle...');
    try {
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Get initial title
      const initialTitle = await page.$eval('h1', el => el.textContent);
      
      // Click toggle button
      await page.click('.link-button');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get new title
      const newTitle = await page.$eval('h1', el => el.textContent);
      
      if (initialTitle !== newTitle) {
        console.log('✅ Test 3 Passed: Toggle between Sign In/Sign Up works\n');
        passed++;
      } else {
        console.log('❌ Test 3 Failed: Toggle does not work\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test 3 Failed: ${error.message}\n`);
      failed++;
    }
    
    // Test 4: Check form validation
    console.log('Test 4: Checking form validation...');
    try {
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Try to submit empty form
      const submitButton = await page.$('button[type="submit"]');
      await submitButton.click();
      
      // Check if browser validation prevents submission
      const emailInput = await page.$('input[type="email"]');
      const isInvalid = await page.evaluate(el => !el.validity.valid, emailInput);
      
      if (isInvalid) {
        console.log('✅ Test 4 Passed: Form validation works\n');
        passed++;
      } else {
        console.log('❌ Test 4 Failed: Form validation not working\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test 4 Failed: ${error.message}\n`);
      failed++;
    }
    
    // Test 5: Check CSS styling loaded
    console.log('Test 5: Checking if CSS styles are loaded...');
    try {
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      const hasStyles = await page.evaluate(() => {
        const loginContainer = document.querySelector('.login-container');
        if (!loginContainer) return false;
        
        const styles = window.getComputedStyle(loginContainer);
        // Check if flex is applied (may be computed as 'flex' or similar)
        return styles.display === 'flex' || styles.display.includes('flex');
      });
      
      if (hasStyles) {
        console.log('✅ Test 5 Passed: CSS styles are loaded\n');
        passed++;
      } else {
        console.log('❌ Test 5 Failed: CSS styles not loaded properly\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test 5 Failed: ${error.message}\n`);
      failed++;
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Print summary
    console.log('═══════════════════════════════════');
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);
    console.log('═══════════════════════════════════');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(APP_URL);
    return true;
  } catch (error) {
    console.error('❌ Error: Development server is not running!');
    console.error('Please run "npm run dev" in another terminal first.\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();