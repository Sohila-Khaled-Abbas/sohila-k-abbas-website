import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'],['html',{outputFolder:'../screenshots/playwright-report',open:'never'}]] : 'list',
  use: {
    baseURL: (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, ''),
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  outputDir: '../screenshots/test-results',
});
