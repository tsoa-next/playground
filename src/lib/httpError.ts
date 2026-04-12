export class HttpError extends Error {
  public readonly details?: unknown
  public readonly status: number

  public constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

type ErrorLike = {
  details?: unknown
  fields?: unknown
  message?: unknown
  name?: unknown
  status?: unknown
}

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === 'object' && error !== null
}

function getObjectNumberProperty(error: object, key: string): number | undefined {
  const value = Reflect.get(error, key)
  return typeof value === 'number' ? value : undefined
}

function getObjectUnknownProperty(error: object, key: string): unknown {
  return Reflect.get(error, key)
}

export function toErrorPayload(error: unknown) {
  if (error instanceof HttpError) {
    return {
      details: error.details,
      message: error.message,
      name: error.name,
      status: error.status,
    }
  }

  if (error instanceof Error) {
    const status = getObjectNumberProperty(error, 'status') ?? 500
    const payload: {
      details?: unknown
      fields?: unknown
      message: string
      name: string
      status: number
    } = {
      message: error.message,
      name: error.name,
      status,
    }

    const details = getObjectUnknownProperty(error, 'details')
    if (details !== undefined) {
      payload.details = details
    }

    const fields = getObjectUnknownProperty(error, 'fields')
    if (fields !== undefined) {
      payload.fields = fields
    }

    return payload
  }

  if (isErrorLike(error)) {
    const payload: {
      details?: unknown
      fields?: unknown
      message: string
      name: string
      status: number
    } = {
      message: typeof error.message === 'string' ? error.message : 'An unknown error occurred.',
      name: typeof error.name === 'string' ? error.name : 'UnknownError',
      status: typeof error.status === 'number' ? error.status : 500,
    }

    if (error.details !== undefined) {
      payload.details = error.details
    }

    if (error.fields !== undefined) {
      payload.fields = error.fields
    }

    return {
      ...payload,
    }
  }

  return {
    message: 'An unknown error occurred.',
    name: 'UnknownError',
    status: 500,
  }
}
