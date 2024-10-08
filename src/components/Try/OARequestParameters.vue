<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue'

const props = defineProps({
  request: { // v-model
    type: Object,
    default: () => ({
      url: '',
      headers: {},
    }),
  },
  operationId: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  baseUrl: {
    type: String,
    required: true,
  },
  parameters: {
    type: Array,
    required: true,
  },
  securitySchemes: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits([
  'update:request',
])

const headerParameters = props.parameters.filter(parameter => parameter && parameter.in === 'header')

const pathParameters = props.parameters.filter(parameter => parameter && parameter.in === 'path')

const queryParameters = props.parameters.filter(parameter => parameter && parameter.in === 'query')

const variables = ref({
  ...headerParameters.reduce((acc, parameter) => {
    acc[parameter.name] = parameter.example ?? parameter.schema?.example ?? ''
    return acc
  }, {}),
  ...pathParameters.reduce((acc, parameter) => {
    acc[parameter.name] = parameter.example ?? parameter.schema?.example ?? ''
    return acc
  }, {}),
  ...queryParameters.reduce((acc, parameter) => {
    acc[parameter.name] = parameter.example ?? parameter.schema?.example ?? ''
    return acc
  }, {}),
})

const auth = ref({
  ...Object.fromEntries(
    Object.entries(props.securitySchemes).map(([name, scheme]) => {
      switch (scheme.type) {
        case 'http':
          return [name, scheme.scheme === 'basic' ? 'Basic Auth' : 'Bearer Token']
        case 'apiKey':
          return [name, scheme.name]
        case 'openIdConnect':
          return [name, 'OpenID Connect']
        case 'oauth2':
          return [name, 'OAuth2 Token']
        default:
          return [name, '']
      }
    }),
  ),
})

function buildRequest() {
  let requestPath = props.path

  for (const [key, value] of Object.entries(variables.value)) {
    if (!pathParameters.find(parameter => parameter.name === key)) {
      continue
    }

    if (!value) {
      continue
    }

    requestPath = requestPath.replace(`{${key}}`, value)
  }

  const url = new URL(`${props.baseUrl}${requestPath}`)

  for (const [key, value] of Object.entries(variables.value)) {
    if (!queryParameters.find(parameter => parameter.name === key)) {
      continue
    }

    if (!value) {
      continue
    }

    url.searchParams.set(key, value)
  }

  const headers = new Headers()

  for (const [key, value] of Object.entries(variables.value)) {
    if (!headerParameters.find(parameter => parameter.name === key)) {
      continue
    }

    if (!value) {
      continue
    }

    headers.set(key, value)
  }

  for (const [key, value] of Object.entries(auth.value)) {
    if (!props.securitySchemes[key] || !value) {
      continue
    }

    switch (props.securitySchemes[key].type) {
      case 'http':
        headers.set('Authorization', `${props.securitySchemes[key].scheme === 'basic' ? 'Basic' : 'Bearer'} ${value}`)
        break
      case 'apiKey':
        headers.set(props.securitySchemes[key].name, value)
        break
      case 'openIdConnect':
        headers.set('Authorization', `Bearer ${value}`)
        break
      case 'oauth2':
        headers.set('Authorization', `Bearer ${value}`)
        break
    }
  }

  const newRequest = {
    url: url.toString(),
    headers: Object.fromEntries(headers),
  }

  emits('update:request', newRequest)

  return newRequest
}

watch([variables, auth], buildRequest, { deep: true, immediate: true })
</script>

<template>
  <div class="flex flex-col">
    <details
      v-if="Object.keys(props.securitySchemes).length"
      open
      class="flex flex-col"
    >
      <summary class="my-0! text-lg font-bold cursor-pointer">
        {{ $t('Authorization') }}
      </summary>

      <div class="flex flex-col">
        <div
          v-for="(scheme, name) in props.securitySchemes"
          :key="name"
          class="flex flex-col gap-2"
        >
          <div class="flex flex-row items-center space-x-2">
            <span class="text-sm font-bold">{{ name }}</span>
          </div>
          <div class="flex flex-row items-center space-x-2">
            <OARequestSecurityInput
              v-model="auth[name]"
              :scheme="scheme"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </details>

    <details
      v-if="headerParameters.length"
      open
      class="flex flex-col"
    >
      <summary class="my-0! text-lg font-bold cursor-pointer">
        {{ $t('Headers') }}
      </summary>

      <div class="flex flex-col">
        <div
          v-for="parameter in headerParameters"
          :key="parameter.name"
          class="flex flex-col gap-2"
        >
          <div class="flex flex-row items-center space-x-2">
            <span class="text-sm font-bold">{{ parameter.name }}</span>
            <span
              v-if="parameter.required"
              class="text-sm text-red-500"
            >*</span>
          </div>
          <div class="flex flex-row items-center space-x-2">
            <OARequestParameterInput
              v-model="variables[parameter.name]"
              :parameter="parameter"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </details>

    <details
      v-if="Object.keys(queryParameters).length || Object.keys(pathParameters).length"
      open
      class="flex flex-col"
    >
      <summary class="my-0! text-lg font-bold cursor-pointer">
        {{ $t('Variables') }}
      </summary>

      <div class="flex flex-col space-y-2">
        <div class="flex flex-row gap-2">
          <div class="w-1/2 flex justify-start">
            <span class="text-xs text-gray-700 dark:text-gray-300 uppercase">{{ $t('Key') }}</span>
          </div>
          <div class="w-1/2 flex justify-start">
            <span class="text-xs text-gray-700 dark:text-gray-300 uppercase">{{ $t('Value') }}</span>
          </div>
        </div>

        <div
          v-for="parameter in [...pathParameters, ...queryParameters]"
          :key="parameter.name"
          class="flex flex-row gap-2"
        >
          <div class="w-1/2 flex flex-row items-center space-x-2">
            <span class="text-sm font-bold">{{ parameter.name }}</span>
            <span
              v-if="parameter.required"
              class="text-sm text-red-500"
            >*</span>
          </div>
          <div class="w-1/2 flex flex-row items-center space-x-2">
            <OARequestParameterInput
              v-model="variables[parameter.name]"
              :parameter="parameter"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </details>
  </div>
</template>
