import type { OpenAPI } from '@scalar/openapi-types'
import { generateMissingOperationIds } from './generateMissingOperationIds'
import { generateMissingSummary } from './generateMissingSummary'
import { generateMissingTags } from './generateMissingTags'

export function prepareOpenAPI({
  spec,
  defaultTag = undefined,
  defaultTagDescription = undefined,
}: {
  spec: OpenAPI.Document
  defaultTag?: string
  defaultTagDescription?: string
}): OpenAPI.Document {
  if (import.meta.env.VITE_DEBUG) {
    console.warn('Transforming OpenAPI spec:', spec)
  }

  if (!spec) {
    return {}
  }

  if (!spec.openapi || !spec.openapi.startsWith('3.')) {
    console.warn('Only OpenAPI 3.x is supported')
    return {}
  }

  if (spec?.paths) {
    spec = generateMissingOperationIds(spec)
    spec = generateMissingSummary(spec)
    spec = generateMissingTags({ spec, defaultTag, defaultTagDescription })
  }

  return Object.assign({}, spec)
}
