import { expect, test } from '@playwright/test'

// These tests share the demo controller's counters and stay sequential in one file.
test('summarizes the SpecPath showcase targets', async ({ request }) => {
  const response = await request.get('/v1/specPath')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.availableSpecTargets).toContain('spec')
  expect(body.availableDocsTargets).toContain('swaggerUi')
  expect(body.conditionalSpecTargets).toContain('gated')
  expect(body.disabledSpecTargets).toContain('disabled')
  expect(body.state.customStringCalls).toBe(0)
})

test('serves the built-in SpecPath JSON and YAML targets', async ({ request }) => {
  const jsonResponse = await request.get('/v1/specPath/spec')
  const jsonBody = await jsonResponse.json()

  expect(jsonResponse.ok()).toBeTruthy()
  expect(jsonResponse.headers()['content-type']).toContain('application/json')
  expect(jsonBody.info.title).toBe('tsoa-next Playground API')

  const yamlResponse = await request.get('/v1/specPath/yaml')
  const yamlBody = await yamlResponse.text()

  expect(yamlResponse.ok()).toBeTruthy()
  expect(yamlResponse.headers()['content-type']).toContain('application/yaml')
  expect(yamlBody).toContain('title: tsoa-next Playground API')
})

test('gates request-aware SpecPath routes and skips disabled ones', async ({ request }) => {
  const gatedDeniedResponse = await request.get('/v1/specPath/gated')
  expect(gatedDeniedResponse.status()).toBe(404)

  const gatedAllowedResponse = await request.get('/v1/specPath/gated', {
    headers: {
      'x-allow-spec': 'true',
    },
  })
  const gatedAllowedBody = await gatedAllowedResponse.json()

  expect(gatedAllowedResponse.ok()).toBeTruthy()
  expect(gatedAllowedResponse.headers()['content-type']).toContain('application/json')
  expect(gatedAllowedBody.info.title).toBe('tsoa-next Playground API')

  const disabledResponse = await request.get('/v1/specPath/disabled')
  expect(disabledResponse.status()).toBe(404)
})

test('caches the custom SpecPath string handler', async ({ request }) => {
  await request.post('/v1/specPath/state/reset')

  const firstResponse = await request.get('/v1/specPath/customString')
  const secondResponse = await request.get('/v1/specPath/customString')
  const stateResponse = await request.get('/v1/specPath/state')
  const stateBody = await stateResponse.json()

  expect(firstResponse.ok()).toBeTruthy()
  expect(await firstResponse.text()).toContain('custom:tsoa-next Playground API')
  expect(secondResponse.ok()).toBeTruthy()
  expect(await secondResponse.text()).toContain('custom:tsoa-next Playground API')
  expect(stateBody.customStringCalls).toBe(1)
})

test('exposes cached and uncached custom SpecPath stream handlers', async ({ request }) => {
  await request.post('/v1/specPath/state/reset')

  const firstStreamResponse = await request.get('/v1/specPath/customStream')
  const secondStreamResponse = await request.get('/v1/specPath/customStream')
  const firstCachedResponse = await request.get('/v1/specPath/customCachedStream')
  const secondCachedResponse = await request.get('/v1/specPath/customCachedStream')
  const stateResponse = await request.get('/v1/specPath/state')
  const stateBody = await stateResponse.json()

  expect(firstStreamResponse.ok()).toBeTruthy()
  expect(await firstStreamResponse.text()).toContain('streamed custom spec')
  expect(secondStreamResponse.ok()).toBeTruthy()
  expect(await secondStreamResponse.text()).toContain('streamed custom spec')
  expect(firstCachedResponse.ok()).toBeTruthy()
  expect(await firstCachedResponse.text()).toContain('streamed custom spec')
  expect(secondCachedResponse.ok()).toBeTruthy()
  expect(await secondCachedResponse.text()).toContain('streamed custom spec')
  expect(stateBody.customStreamCalls).toBe(3)
  expect(stateBody.customCacheGets).toBe(2)
  expect(stateBody.customCacheSets).toBe(1)
})

test('serves the built-in SpecPath UI shells', async ({ request }) => {
  const swaggerResponse = await request.get('/v1/specPath/swaggerUi')
  const swaggerBody = await swaggerResponse.text()

  expect(swaggerResponse.ok()).toBeTruthy()
  expect(swaggerResponse.headers()['content-type']).toContain('text/html')
  expect(swaggerBody).toContain('SwaggerUIBundle')
  expect(swaggerBody).toContain('tsoa-next Playground API')

  const redocResponse = await request.get('/v1/specPath/redocUi')
  const redocBody = await redocResponse.text()

  expect(redocResponse.ok()).toBeTruthy()
  expect(redocBody).toContain('Redoc.init')
  expect(redocBody).toContain('tsoa-next Playground API')

  const rapidocResponse = await request.get('/v1/specPath/rapidocUi')
  const rapidocBody = await rapidocResponse.text()

  expect(rapidocResponse.ok()).toBeTruthy()
  expect(rapidocBody).toContain('<rapi-doc')
  expect(rapidocBody).toContain('tsoa-next Playground API')
})

test('resets SpecPath counters back to zero after exercising the custom handlers', async ({ request }) => {
  const initialResetResponse = await request.post('/v1/specPath/state/reset')
  const initialResetBody = await initialResetResponse.json()

  expect(initialResetResponse.ok()).toBeTruthy()
  expect(initialResetBody).toEqual({
    customCacheGets: 0,
    customCacheSets: 0,
    customStreamCalls: 0,
    customStringCalls: 0,
  })

  await request.get('/v1/specPath/customStream')

  const dirtyStateResponse = await request.get('/v1/specPath/state')
  const dirtyStateBody = await dirtyStateResponse.json()

  expect(dirtyStateBody.customStreamCalls).toBeGreaterThan(0)

  const resetResponse = await request.post('/v1/specPath/state/reset')
  const resetBody = await resetResponse.json()
  const cleanStateResponse = await request.get('/v1/specPath/state')
  const cleanStateBody = await cleanStateResponse.json()

  expect(resetResponse.ok()).toBeTruthy()
  expect(resetBody).toEqual({
    customCacheGets: 0,
    customCacheSets: 0,
    customStreamCalls: 0,
    customStringCalls: 0,
  })
  expect(cleanStateBody).toEqual(resetBody)
})

test('runs an uncached custom string handler on every request', async ({ request }) => {
  await request.post('/v1/specPath/state/reset')
  for (let i = 0; i < 2; i++) {
    const response = await request.get('/v1/specPath/customUncachedString')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('custom:tsoa-next Playground API')
  }
  expect((await (await request.get('/v1/specPath/state')).json()).customStringCalls).toBe(2)
})
