export interface SpecPathShowcaseStateView {
  customCacheGets: number
  customCacheSets: number
  customStreamCalls: number
  customStringCalls: number
}

export interface SpecPathShowcaseStatusView {
  availableDocsTargets: string[]
  availableSpecTargets: string[]
  state: SpecPathShowcaseStateView
}
