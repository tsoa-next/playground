import { defineConfig } from '@playwright/test'

const frameworks: Array<{ command: string; name: string; port: number }> = [
  { command: 'npm run serve:express', name: 'express', port: 3101 },
  { command: 'npm run serve:koa', name: 'koa', port: 3102 },
  { command: 'npm run serve:hapi', name: 'hapi', port: 3103 },
]

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*Spec.ts',
  timeout: 30_000,
  reporter: 'list',
  use: {
    extraHTTPHeaders: {
      accept: 'application/json',
    },
  },
  projects: frameworks.map(framework => ({
    name: framework.name,
    use: {
      baseURL: `http://127.0.0.1:${framework.port}`,
    },
  })),
  webServer: frameworks.map(framework => ({
    command: framework.command,
    env: {
      PORT: String(framework.port),
    },
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 120_000,
    url: `http://127.0.0.1:${framework.port}/health`,
  })),
})
