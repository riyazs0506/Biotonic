import { defineConfig, devices } from '@playwright/test';

const PORT = 4310;

/**
 * End-to-end tests run against the production build (`npm run build`) served by the real
 * Node server, using the in-memory "capture" mail transport so no email is sent.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node dist/server/index.js',
    port: PORT,
    reuseExistingServer: false,
    env: {
      NODE_ENV: 'test',
      PORT: String(PORT),
      SITE_URL: `http://localhost:${PORT}`,
      MAIL_TRANSPORT: 'capture',
      RATE_LIMIT_MAX: '100',
    },
  },
});
