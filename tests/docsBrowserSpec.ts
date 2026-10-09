import { expect, test } from '@playwright/test'

test('renders the docs hub and Swagger UI and fetches its actual spec', async ({ page }) => {
  await page.goto('/docs')
  await expect(page.getByRole('link', { name: /Swagger UI/ }).first()).toBeVisible()
  const spec = page.waitForResponse(response => response.url().endsWith('/spec/openapi.yaml') && response.status() === 200)
  await page.goto('/docs/swagger')
  await spec
  await expect(page.locator('.swagger-ui .info .title')).toContainText('tsoa-next Playground API')
  await expect(page.locator('.opblock-summary-path').first()).toBeVisible()
})

for (const target of ['swaggerUi', 'redocUi', 'rapidocUi']) {
  test(`renders the embedded ${target} with the generated spec`, async ({ page }) => {
    await page.goto(`/v1/specPath/${target}`)
    if (target === 'swaggerUi') {
      await expect(page.locator('.swagger-ui .info .title')).toContainText('tsoa-next Playground API')
      await expect(page.locator('.opblock-summary-path').first()).toBeVisible()
    } else if (target === 'redocUi') {
      await expect(page.locator('#redoc-container h1').first()).toContainText('tsoa-next Playground API')
      await expect(page.locator('#redoc-container')).toContainText('catalog')
    } else {
      await expect(page.locator('rapi-doc')).toBeVisible()
      await expect(page.locator('rapi-doc').getByText('tsoa-next Playground API', { exact: false }).first()).toBeVisible()
    }
  })
}
