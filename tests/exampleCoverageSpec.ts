import type { APIResponse } from '@playwright/test'
import { expect, test } from '@playwright/test'

type Framework = 'express' | 'koa' | 'hapi'

const frameworkLabels: Record<Framework, string> = {
  express: 'Express',
  hapi: 'Hapi',
  koa: 'Koa',
}

const frameworkPorts: Record<Framework, number> = {
  express: 3101,
  hapi: 3103,
  koa: 3102,
}

const frameworkSpecFiles: Record<Framework, string> = {
  express: 'expressApi.yaml',
  hapi: 'hapiApi.yaml',
  koa: 'koaApi.yaml',
}

const apiMiddlewarePaths: Record<Framework, string> = {
  express: '/v1/middleware/express/trace',
  hapi: '/v1/middleware/hapi/trace',
  koa: '/v1/middleware/koa/trace',
}

const specMiddlewarePaths: Record<Framework, string> = {
  express: '/middleware/express/trace',
  hapi: '/middleware/hapi/trace',
  koa: '/middleware/koa/trace',
}

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

const invalidValidationCases: Array<{ kind: string; payload: unknown }> = [
  {
    kind: 'zod',
    payload: {
      name: 'no',
      status: 'active',
      tags: [],
    },
  },
  {
    kind: 'joi',
    payload: {
      auditId: 0,
      name: 'no',
      status: 'active',
      tags: [],
    },
  },
  {
    kind: 'yup',
    payload: {
      name: 'no',
      status: 'active',
      tags: [],
    },
  },
  {
    kind: 'superstruct',
    payload: {
      auditId: 0,
      name: 'no',
      status: 'active',
      tags: [],
    },
  },
  {
    kind: 'ioTs',
    payload: {
      amount: -1,
      outcome: 0,
    },
  },
]

function getFramework(projectName: string): Framework {
  if (projectName === 'express' || projectName === 'koa' || projectName === 'hapi') {
    return projectName
  }

  throw new Error(`Unsupported framework project '${projectName}'.`)
}

async function expectError(response: APIResponse, status: number, messageFragment?: string) {
  expect(response.status()).toBe(status)
  const bodyText = await response.text()
  expect(bodyText.length).toBeGreaterThan(0)

  if (messageFragment) {
    expect(bodyText).toContain(messageFragment)
  }
}

test('reports framework health metadata', async ({ request }, testInfo) => {
  const framework = getFramework(testInfo.project.name)
  const response = await request.get('/health')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body).toEqual({
    framework,
    status: 'ok',
  })
})

test('uses the documented defaults for featured catalog and catalog item lookups', async ({ request }) => {
  const featuredResponse = await request.get('/v1/catalog/featured')
  const featuredBody = await featuredResponse.json()

  expect(featuredResponse.ok()).toBeTruthy()
  expect(featuredBody.audience).toBe('retail')
  expect(featuredBody.generatedAt).toBe('2026-04-11T15:00:00.000Z')
  expect(featuredBody.items).toHaveLength(2)

  const itemResponse = await request.get('/v1/catalog/SKU-BRAVO-2')
  const itemBody = await itemResponse.json()

  expect(itemResponse.ok()).toBeTruthy()
  expect(itemBody.market).toBe('us')
  expect(itemBody.warehouse).toBe('west-hub')
  expect(itemBody.merchandisingLabel).toBe('team-favorite')
})

test('returns explicit not-found errors for missing catalog items and draft ids', async ({ request }) => {
  await expectError(await request.get('/v1/catalog/SKU-MISSING-404'), 404, 'No catalog item exists')
  await expectError(await request.get('/v1/order-drafts/draft-missing-404'), 404, 'No draft found')
})

test('covers standard shipping behavior and invalid shipping inputs', async ({ request }) => {
  const standardQuoteResponse = await request.get(
    '/v1/shipping/quote?destinationCountryCode=US&destinationPostalCode=60601&parcels=1&expedited=false&market=us',
  )
  const standardQuoteBody = await standardQuoteResponse.json()

  expect(standardQuoteResponse.ok()).toBeTruthy()
  expect(standardQuoteBody.serviceLevel).toBe('standard')
  expect(standardQuoteBody.estimatedBusinessDays).toBe(5)
  expect(standardQuoteBody.quoteId).toBe('postal-priority-60601-1')
  expect(standardQuoteBody.quotedAmount).toBe(8)

  await expectError(
    await request.get(
      '/v1/shipping/quote?destinationCountryCode=US&destinationPostalCode=60601&parcels=0&expedited=false&market=us',
    ),
    400,
  )
  await expectError(
    await request.get(
      '/v1/shipping/carriers/not-a-carrier/quote?destinationCountryCode=US&destinationPostalCode=60601&parcels=1&expedited=false&market=us',
    ),
    400,
  )
})

test('defaults order repricing to USD when the currency query is omitted', async ({ request }) => {
  const response = await request.post('/v1/order-drafts/pricing', {
    data: sampleDraftRequest,
  })
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.currency).toBe('USD')
  expect(body.subtotal.amount).toBe(320)
  expect(body.tax.amount).toBe(26.4)
  expect(body.grandTotal.amount).toBe(346.4)
})

for (const validationCase of invalidValidationCases) {
  test(`rejects invalid ${validationCase.kind} payloads`, async ({ request }) => {
    const response = await request.post(`/v1/validation/external/${validationCase.kind}`, {
      data: validationCase.payload,
    })

    expect(response.headers()['content-type']).toContain('application/json')
    await expectError(response, 400)
  })
}

test('surfaces documented docs metadata and all Swagger UI assets', async ({ request }, testInfo) => {
  const framework = getFramework(testInfo.project.name)
  const docsResponse = await request.get('/docs', {
    headers: {
      accept: 'text/html',
    },
  })
  const docsBody = await docsResponse.text()

  expect(docsResponse.ok()).toBeTruthy()
  expect(docsBody).toContain(`${frameworkLabels[framework]} Spec Explorer`)
  expect(docsBody).toContain(`src/specs/${frameworkSpecFiles[framework]}`)
  expect(docsBody).toContain(apiMiddlewarePaths[framework])

  const cssResponse = await request.get('/docs/assets/swagger/swagger-ui.css')
  const cssBody = await cssResponse.text()
  expect(cssResponse.ok()).toBeTruthy()
  expect(cssResponse.headers()['content-type']).toContain('text/css')
  expect(cssBody).toContain('.swagger-ui')

  const bundleResponse = await request.get('/docs/assets/swagger/swagger-ui-bundle.js')
  const bundleBody = await bundleResponse.text()
  expect(bundleResponse.ok()).toBeTruthy()
  expect(bundleBody).toContain('SwaggerUIBundle')

  const presetResponse = await request.get('/docs/assets/swagger/swagger-ui-standalone-preset.js')
  const presetBody = await presetResponse.text()
  expect(presetResponse.ok()).toBeTruthy()
  expect(presetResponse.headers()['content-type']).toContain('application/javascript')
  expect(presetBody).toContain('SwaggerUIStandalonePreset')
})

test('embeds documented examples and validator metadata into the generated OpenAPI spec', async ({ request }, testInfo) => {
  const framework = getFramework(testInfo.project.name)
  const response = await request.get('/spec/openapi.json')
  const body = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(body.info.title).toBe('tsoa-next Playground API')
  expect(body.servers[0].url).toBe(`http://127.0.0.1:${frameworkPorts[framework]}/v1`)
  expect(body.paths[specMiddlewarePaths[framework]]).toBeTruthy()
  expect(body.paths['/specPath']).toBeTruthy()
  expect(body.paths['/specPath/spec']).toBeUndefined()
  expect(body.paths['/specPath/yaml']).toBeUndefined()
  expect(body.paths['/specPath/gated']).toBeUndefined()

  const featuredExample = body.paths['/catalog/featured'].get.responses['200'].content['application/json'].examples['Example 1']
  expect(featuredExample.value.audience).toBe('retail')
  expect(featuredExample.value.items[0].sku).toBe('SKU-ALPHA-1')

  const featuredAudienceParameter = body.paths['/catalog/featured'].get.parameters.find(
    (parameter: { name: string }) => parameter.name === 'audience',
  )
  expect(featuredAudienceParameter.schema.default).toBe('retail')

  const shippingParcelsParameter = body.paths['/shipping/quote'].get.parameters.find(
    (parameter: { name: string }) => parameter.name === 'parcels',
  )
  expect(shippingParcelsParameter.schema.minimum).toBe(1)

  const expectedValidators = {
    ioTs: 'io-ts',
    joi: 'joi',
    superstruct: 'superstruct',
    yup: 'yup',
    zod: 'zod',
  }

  for (const [routeSuffix, validatorKind] of Object.entries(expectedValidators)) {
    const schema =
      body.paths[`/validation/external/${routeSuffix}`].post.requestBody.content['application/json'].schema
    expect(schema['x-schema-validator']).toBe(validatorKind)
  }
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

test('keeps middleware examples isolated to the matching framework and resets traces per request', async ({ request }, testInfo) => {
  const framework = getFramework(testInfo.project.name)
  const matchingPath = apiMiddlewarePaths[framework]

  const firstResponse = await request.get(matchingPath)
  const firstBody = await firstResponse.json()
  const secondResponse = await request.get(matchingPath)
  const secondBody = await secondResponse.json()

  expect(firstResponse.ok()).toBeTruthy()
  expect(secondResponse.ok()).toBeTruthy()
  expect(firstBody.events).toEqual(secondBody.events)

  for (const [candidateFramework, candidatePath] of Object.entries(apiMiddlewarePaths)) {
    if (candidateFramework === framework) {
      continue
    }

    const response = await request.get(candidatePath)
    expect(response.status()).toBe(404)
  }
})
