import { expect, test } from '@playwright/test'

const sampleDraftRequest = {
  customerId: 'customer-42',
  lines: [
    { quantity: 2, sku: 'SKU-ALPHA-1', unitPrice: 128 },
    { quantity: 1, sku: 'SKU-BRAVO-2', unitPrice: 64 },
  ],
  notes: 'Urgent review requested.',
  requestedCurrency: 'USD',
  shippingPostalCode: '94107',
}

const taggedEntityPayload = {
  name: 'showcase',
  status: 'active',
  tags: ['alpha', 'beta'],
}

const auditedTaggedEntityPayload = {
  auditId: 17,
  name: 'showcase',
  status: 'active',
  tags: ['alpha', 'beta'],
}

const wagerSubmissionPayload = {
  amount: 12.5,
  outcome: 2,
}

function resolveFrameworkLabel(projectName: string): string {
  switch (projectName) {
    case 'express':
      return 'Express'
    case 'koa':
      return 'Koa'
    case 'hapi':
      return 'Hapi'
    default:
      return projectName
  }
}

function resolveMiddlewarePath(projectName: string): string {
  switch (projectName) {
    case 'express':
      return '/middleware/express/trace'
    case 'koa':
      return '/middleware/koa/trace'
    case 'hapi':
      return '/middleware/hapi/trace'
    default:
      return '/middleware'
  }
}

test('lists the featured catalog cards', async ({ request }) => {
  const response = await request.get('/v1/catalog/featured?audience=retail')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.audience).toBe('retail')
  expect(body.items).toHaveLength(2)
  expect(body.items[0].sku).toBe('SKU-ALPHA-1')
})

test('resolves an individual catalog item using path, header, and query inputs', async ({ request }) => {
  const response = await request.get('/v1/catalog/SKU-ALPHA-1?warehouse=east-hub', {
    headers: {
      'x-market': 'eu',
    },
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.market).toBe('eu')
  expect(body.warehouse).toBe('east-hub')
  expect(body.title).toBe('Transit Backpack')
})

test('calculates a shipping quote from grouped query parameters', async ({ request }) => {
  const response = await request.get(
    '/v1/shipping/quote?destinationCountryCode=US&destinationPostalCode=94107&parcels=2&expedited=true&market=us',
  )
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.serviceLevel).toBe('expedited')
  expect(body.quoteId).toBe('postal-priority-94107-2')
  expect(body.quotedAmount).toBe(30)
})

test('calculates a carrier-specific shipping quote', async ({ request }) => {
  const response = await request.get(
    '/v1/shipping/carriers/city-bike/quote?destinationCountryCode=NL&destinationPostalCode=1011AB&parcels=3&expedited=false&market=eu',
  )
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.carrierCode).toBe('city-bike')
  expect(body.currency).toBe('EUR')
  expect(body.quotedAmount).toBe(21.6)
})

test('creates and retrieves an order draft', async ({ request }) => {
  const createResponse = await request.post('/v1/order-drafts', {
    data: sampleDraftRequest,
  })
  const createdDraft = await createResponse.json()

  expect(createResponse.status()).toBe(201)
  expect(createdDraft.status).toBe('draft')
  expect(createdDraft.subtotal.amount).toBe(320)

  const fetchResponse = await request.get(`/v1/order-drafts/${createdDraft.draftId}`)
  const fetchedDraft = await fetchResponse.json()

  expect(fetchResponse.ok()).toBeTruthy()
  expect(fetchedDraft.draftId).toBe(createdDraft.draftId)
  expect(fetchedDraft.shippingPostalCode).toBe('94107')
})

test('reprices an order draft payload in the requested output currency', async ({ request }) => {
  const response = await request.post('/v1/order-drafts/pricing?currency=EUR', {
    data: sampleDraftRequest,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.currency).toBe('EUR')
  expect(body.subtotal.amount).toBe(320)
  expect(body.tax.amount).toBe(60.8)
  expect(body.grandTotal.amount).toBe(380.8)
})

test('validates a payload with zod', async ({ request }) => {
  const response = await request.post('/v1/validation/external/zod', {
    data: taggedEntityPayload,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual(taggedEntityPayload)
})

test('validates a payload with joi', async ({ request }) => {
  const response = await request.post('/v1/validation/external/joi', {
    data: auditedTaggedEntityPayload,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual(auditedTaggedEntityPayload)
})

test('validates a payload with yup', async ({ request }) => {
  const response = await request.post('/v1/validation/external/yup', {
    data: taggedEntityPayload,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual(taggedEntityPayload)
})

test('validates a payload with superstruct', async ({ request }) => {
  const response = await request.post('/v1/validation/external/superstruct', {
    data: auditedTaggedEntityPayload,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual(auditedTaggedEntityPayload)
})

test('validates a payload with io-ts', async ({ request }) => {
  const response = await request.post('/v1/validation/external/ioTs', {
    data: wagerSubmissionPayload,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual(wagerSubmissionPayload)
})

test('rejects an invalid external validation payload', async ({ request }) => {
  const response = await request.post('/v1/validation/external/zod', {
    data: {
      name: 'no',
      status: 'active',
      tags: [],
    },
  })

  expect(response.status()).toBe(400)
})

test('serves the generated OpenAPI YAML spec', async ({ request }, testInfo) => {
  const response = await request.get('/spec/openapi.yaml', {
    headers: {
      accept: 'application/yaml',
    },
  })
  const body = await response.text()

  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('application/yaml')
  expect(body).toContain('openapi: 3.1.0')
  expect(body).toContain('title: tsoa-next Playground API')
  expect(body).toContain(resolveMiddlewarePath(testInfo.project.name))
})

test('serves the generated OpenAPI JSON spec', async ({ request }, testInfo) => {
  const response = await request.get('/spec/openapi.json')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('application/json')
  expect(body.openapi).toBe('3.1.0')
  expect(body.info.title).toBe('tsoa-next Playground API')
  expect(body.paths[resolveMiddlewarePath(testInfo.project.name)]).toBeTruthy()
})

test('serves the spec explorer index and Swagger UI shell', async ({ request }, testInfo) => {
  const frameworkLabel = resolveFrameworkLabel(testInfo.project.name)

  const docsResponse = await request.get('/docs', {
    headers: {
      accept: 'text/html',
    },
  })
  const docsBody = await docsResponse.text()

  expect(docsResponse.ok()).toBeTruthy()
  expect(docsResponse.headers()['content-type']).toContain('text/html')
  expect(docsBody).toContain(`${frameworkLabel} Spec Explorer`)
  expect(docsBody).toContain('/spec/openapi.yaml')
  expect(docsBody).toContain('/spec/openapi.json')
  expect(docsBody).toContain('/docs/swagger')

  const swaggerShellResponse = await request.get('/docs/swagger', {
    headers: {
      accept: 'text/html',
    },
  })
  const swaggerShellBody = await swaggerShellResponse.text()

  expect(swaggerShellResponse.ok()).toBeTruthy()
  expect(swaggerShellResponse.headers()['content-type']).toContain('text/html')
  expect(swaggerShellBody).toContain(`${frameworkLabel} Swagger UI`)
  expect(swaggerShellBody).toContain('/docs/assets/swagger/swagger-ui.css')
  expect(swaggerShellBody).toContain('/docs/assets/swagger/swagger-ui-bundle.js')
  expect(swaggerShellBody).toContain('/spec/openapi.yaml')

  const swaggerBundleResponse = await request.get('/docs/assets/swagger/swagger-ui-bundle.js')
  const swaggerBundleBody = await swaggerBundleResponse.text()

  expect(swaggerBundleResponse.ok()).toBeTruthy()
  expect(swaggerBundleResponse.headers()['content-type']).toContain('application/javascript')
  expect(swaggerBundleBody).toContain('SwaggerUIBundle')
})

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

test('shows express middleware order on the express server', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'express', 'Express middleware showcase is only generated for the Express server.')

  const response = await request.get('/v1/middleware/express/trace')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.framework).toBe('express')
  expect(body.events).toEqual(['express:controller', 'express:method:first', 'express:method:second'])
})

test('shows koa middleware order on the koa server', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'koa', 'Koa middleware showcase is only generated for the Koa server.')

  const response = await request.get('/v1/middleware/koa/trace')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.framework).toBe('koa')
  expect(body.events).toEqual(['koa:controller', 'koa:method:first', 'koa:method:second'])
})

test('shows hapi middleware order on the hapi server', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'hapi', 'Hapi middleware showcase is only generated for the Hapi server.')

  const response = await request.get('/v1/middleware/hapi/trace')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.framework).toBe('hapi')
  expect(body.events).toEqual(['hapi:controller', 'hapi:method:first', 'hapi:method:second'])
})
