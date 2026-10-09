import { expect, test } from '@playwright/test'

const apiKey = { 'x-api-key': 'playground-key' }
const reader = { authorization: 'Bearer playground-token', 'x-scopes': 'read' }

test('uses root security, NoSecurity, alternatives, combined credentials and scopes', async ({ request }) => {
  expect((await request.get('/v1/security/root')).status()).toBe(401)
  const root = await request.get('/v1/security/root', { headers: apiKey })
  expect(root.status()).toBe(200)
  expect((await root.json()).user).toMatchObject({ name: 'Ada', scheme: 'api_key' })
  expect((await request.get('/v1/security/public')).status()).toBe(200)
  expect((await request.get('/v1/security/either', { headers: apiKey })).status()).toBe(200)
  expect((await request.get('/v1/security/either', { headers: reader })).status()).toBe(200)
  expect((await request.get('/v1/security/either')).status()).toBe(401)
  expect((await request.get('/v1/security/both', { headers: apiKey })).status()).toBe(401)
  expect((await request.get('/v1/security/both', { headers: reader })).status()).toBe(401)
  expect((await request.get('/v1/security/both', { headers: { ...apiKey, ...reader } })).status()).toBe(200)
  expect((await request.get('/v1/security/scoped', { headers: reader })).status()).toBe(403)
  expect((await request.get('/v1/security/scoped', { headers: { ...reader, 'x-scopes': 'read write' } })).status()).toBe(200)
})

test('binds full bodies, body properties, native requests and request properties with request-scoped IoC', async ({ request }) => {
  async function assertRequestIdentity(id: string) {
    const response = await request.post('/v1/features/greeting', { data: { name: 'Ada' }, headers: { 'x-request-id': id } })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ greeting: 'Hello Ada', requestId: id })
    const native = await request.get('/v1/features/request', { headers: { 'x-request-id': id } })
    expect(await native.json()).toEqual({ sameRequestId: true, requestId: id })
  }
  await assertRequestIdentity('first-request')
  await assertRequestIdentity('second-request')
  const property = await request.post('/v1/features/body-property', { data: { name: 'Ada' } })
  expect(await property.json()).toEqual({ name: 'Ada' })
  expect((await request.post('/v1/features/body-property', { data: {} })).status()).toBe(400)
  expect((await request.post('/v1/features/greeting', { data: { name: 'Ada', extra: 'unused' } })).status()).toBe(400)
})

test('writes typed response callbacks, controller headers and declared media types', async ({ request }) => {
  const accepted = await request.get('/v1/features/response')
  expect(accepted.status()).toBe(200)
  expect(accepted.headers()['x-demo-response']).toBe('success')
  expect(await accepted.json()).toEqual({ message: 'accepted' })
  const rejected = await request.get('/v1/features/response?conflict=true')
  expect(rejected.status()).toBe(409)
  expect(rejected.headers()['x-demo-response']).toBe('conflict')
  expect(await rejected.json()).toEqual({ message: 'Please choose another name' })
  const text = await request.post('/v1/features/media', {
    headers: { 'content-type': 'application/vnd.playground+json', accept: 'text/plain' }, data: { name: 'Ada' },
  })
  expect(text.status()).toBe(200)
  expect(text.headers()['content-type']).toContain('text/plain')
  expect(await text.text()).toBe('Hello Ada')
})

test('dispatches PUT PATCH DELETE HEAD OPTIONS and documents hidden/deprecated extensions', async ({ request }, testInfo) => {
  async function assertVerb(method: 'put' | 'patch') {
    const response = await request[method]('/v1/features/verbs', { data: { name: method } })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ name: method })
  }
  await assertVerb('put')
  await assertVerb('patch')
  expect((await request.delete('/v1/features/verbs')).status()).toBe(204)
  const head = await request.head(testInfo.project.name === 'hapi' ? '/v1/features/hidden' : '/v1/features/verbs')
  expect(head.status()).toBe(testInfo.project.name === 'hapi' ? 200 : 204)
  if (testInfo.project.name !== 'hapi') expect(head.headers()['x-demo-head']).toBe('present')
  expect(await head.text()).toBe('')
  const options = await request.fetch('/v1/features/verbs', { method: 'OPTIONS' })
  expect(options.status()).toBe(200)
  expect((await options.json()).methods).toContain('PATCH')
  expect((await request.get('/v1/features/hidden')).status()).toBe(200)
  expect((await request.get('/v1/features/legacy')).status()).toBe(200)
  const spec = await (await request.get('/spec/openapi.json')).json()
  expect(spec.paths['/features/hidden']).toBeUndefined()
  expect(spec.paths['/features/legacy'].get).toMatchObject({ deprecated: true, 'x-playground': 'legacy' })
  expect(spec.paths['/features/greeting'].post.operationId).toBe('createGreeting')
  expect(spec.paths['/features/media'].post.requestBody.content['application/vnd.playground+json']).toBeTruthy()
  expect(spec.paths['/features/media'].post.responses['200'].content['text/plain']).toBeTruthy()
  expect(spec.paths['/security/root'].get.security).toEqual([{ api_key: [] }])
  expect(spec.paths['/security/public'].get.security ?? []).toEqual([])
})

test('accepts single and multiple multipart uploads and rejects missing required files', async ({ request }) => {
  const single = await request.post('/v1/uploads/single', { multipart: { title: 'Notes', asset: { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') } } })
  expect(single.status()).toBe(200)
  expect(await single.json()).toEqual({ title: 'Notes', name: 'notes.txt', bytes: 5, content: 'hello' })
  const multipart = new FormData()
  multipart.append('assets', new Blob(['first'], { type: 'text/plain' }), 'first.txt')
  multipart.append('assets', new Blob(['second'], { type: 'text/plain' }), 'second.txt')
  const many = await request.post('/v1/uploads/many', { multipart })
  expect(many.status()).toBe(200)
  expect(await many.json()).toEqual({ names: ['first.txt', 'second.txt'], contents: ['first', 'second'] })
  expect((await request.post('/v1/uploads/single', { multipart: { title: 'No asset' } })).status()).toBe(400)
})

