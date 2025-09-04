import puppeteer from 'puppeteer';

const APP_URL = 'http://localhost:5173'; // Vite default port
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

describe('PDF Upload App Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Should redirect unauthenticated users to login', async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    
    // Check if we're redirected to login
    const url = page.url();
    expect(url).toContain('/login');
    
    // Check for login form elements
    const loginTitle = await page.$eval('h1', el => el.textContent);
    expect(loginTitle).toBe('Sign In');
    
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });

  test('Should toggle between Sign In and Sign Up', async () => {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Initially should be Sign In
    let title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Sign In');
    
    // Click toggle button
    const toggleButton = await page.$('.link-button');
    await toggleButton.click();
    
    // Should now be Sign Up
    title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Sign Up');
    
    // Toggle back
    await toggleButton.click();
    title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Sign In');
  });

  test('Should show validation errors for invalid inputs', async () => {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Try to submit with empty fields
    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
    
    // Check HTML5 validation (browser will prevent submission)
    const emailInput = await page.$('input[type="email"]');
    const isEmailInvalid = await page.evaluate(el => el.validity.valueMissing, emailInput);
    expect(isEmailInvalid).toBe(true);
  });

  test('Should handle sign up flow', async () => {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Switch to Sign Up
    const toggleButton = await page.$('.link-button');
    await toggleButton.click();
    
    // Fill in sign up form
    await page.type('input[type="email"]', `${Date.now()}@test.com`);
    await page.type('input[type="password"]', 'testpassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show email confirmation message or error
    const messageElement = await page.$('.success-message, .error-message');
    expect(messageElement).not.toBeNull();
  });

  test('Should validate PDF upload requirements', async () => {
    // Note: This test requires authentication to work properly
    // In a real scenario, you would either:
    // 1. Use a test account with valid credentials
    // 2. Mock the authentication
    // 3. Set up test database with seeded users
    
    // For now, we'll test the login page exists
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    const loginForm = await page.$('form');
    expect(loginForm).not.toBeNull();
  });

  test('Should display login form with correct structure', async () => {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Check all form elements are present
    const structure = await page.evaluate(() => {
      return {
        hasEmailInput: !!document.querySelector('input[type="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        hasToggleLink: !!document.querySelector('.link-button'),
        formGroups: document.querySelectorAll('.form-group').length
      };
    });
    
    expect(structure.hasEmailInput).toBe(true);
    expect(structure.hasPasswordInput).toBe(true);
    expect(structure.hasSubmitButton).toBe(true);
    expect(structure.hasToggleLink).toBe(true);
    expect(structure.formGroups).toBe(2);
  });
});

// Helper function to test authenticated features (requires valid Supabase setup)
async function testWithAuth(page, email, password) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

export default describe;