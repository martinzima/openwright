import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { MockRunReportingApiService } from '@openwright/reporting-api';
import { defineConfig, devices } from '@playwright/test';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src',  }),
  //globalSetup: './global-setup.ts',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 30000
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* Retry on CI only */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['../../../libs/playwright-reporter/src/lib/openwright-reporter.ts', {
      projectId: 'my-project',
      baseUrl: 'http://api.openwright.local',
      reportingClientKey: 'your-key',
      tenantId: 'your-tenant',
      apiService: new MockRunReportingApiService({
        baseUrl: 'http://mock-api.openwright.local',
        reportingClientKey: 'mock-key',
        tenantId: 'mock-tenant',
      }),
    }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx run example-tested-app:serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /*{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
