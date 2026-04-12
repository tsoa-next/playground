export function resolveServerPort(defaultPort: number): number {
  const candidate = process.env.PORT ? Number(process.env.PORT) : defaultPort

  if (!Number.isInteger(candidate) || candidate <= 0) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`)
  }

  return candidate
}

