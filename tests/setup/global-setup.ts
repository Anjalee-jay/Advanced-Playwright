import { chromium, FullConfig, request } from '@playwright/test';
import LoginPage from '../ui/pages/login-page';
import uiPages from '../utils/uiPages';

type DemoUser = {
  username: string;
  password: string;
  userID: string;
};

async function canLogin(loginPage: LoginPage, baseURL: string, username: string, password: string) {
 await loginPage.page.goto(baseURL + uiPages.login, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await loginPage.doLogin(username, password);

  try {
    await loginPage.page.waitForURL(/.*profile/, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function randomPassword() {
  return `Aa1!Tau${Date.now()}`;
}

async function createDemoUser(baseURL: string): Promise<DemoUser> {
  const username = `tau-auto-${Date.now()}`;
  const password = randomPassword();
  const apiContext = await request.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  const response = await apiContext.post('/Account/v1/User', {
    data: { userName: username, password },
  });

  if (!response.ok) {
    const body = await response.text();
    await apiContext.dispose();
    throw new Error(`Unable to create demo user: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as DemoUser;
  await apiContext.dispose();

  return {
    username,
    password,
    userID: payload.userID,
  };
}

async function globalSetup(config: FullConfig) {
  const chromiumProject = config.projects.find((project) => project.name === 'chromium') ?? config.projects[0];
  const { baseURL } = chromiumProject.use;
  const storageState = (chromiumProject.use.storageState as string) || 'storageState.json';

  let user = process.env.USERNAME!;
  let password = process.env.PASSWORD!;

  const browser = await chromium.launch({
    headless: true,
    timeout: 60000,
  });
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);

  if (!baseURL) {
    throw new Error('baseURL is not configured for Playwright global setup.');
  }

  const loggedIn = await canLogin(loginPage, baseURL as string, user, password);

  if (!loggedIn) {
    const demoUser = await createDemoUser(baseURL as string);
    user = demoUser.username;
    password = demoUser.password;

    process.env.USERNAME = demoUser.username;
    process.env.PASSWORD = demoUser.password;
    process.env.USERID = demoUser.userID;

    const createdUserLogin = await canLogin(loginPage, baseURL as string, user, password);

    if (!createdUserLogin) {
      throw new Error('Login failed even after creating a new DemoQA user.');
    }
  }

  await page.context().storageState({ path: storageState });
  await browser.close();
}

export default globalSetup;

// https://playwright.dev/docs/test-global-setup-teardown#capturing-trace-of-failures-during-global-setup
// https://playwright.dev/docs/trace-viewer
