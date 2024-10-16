---
aside: false
outline: false
---

# Custom Slots

The `OAOperation` component provides several slots for customizing the operation layout.

## Description

The `description` slot allows you to customize the operation description.

```markdown
---
aside: false
outline: false
title: vitepress-openapi
---

<script setup lang="ts">
import { useRoute, useData } from 'vitepress'

const route = useRoute()

const { isDark } = useData()

const operationId = route.data.params.operationId
</script>

<OAOperation :operationId="operationId" :isDark="isDark">

<template #description="description">

#### Custom description slot
  
Here you can add any Markdown content or Vue components.

<div class="p-3 bg-gray-100 border">
<p>Description content</p>
</div>

\`\`\`javascript
console.log('Custom description slot')
\`\`\`

</template>

</OAOperation>
```

This will render the following:

::: info Custom description slot 

<script setup lang="ts">
import { useRoute, useData } from 'vitepress'

const route = useRoute()

const { isDark } = useData()
</script>

<OAOperation operationId="getAllArtists" :isDark="isDark">

<template #description="description">

#### Custom description slot

Here you can add any Markdown content or Vue components.

<div class="p-3 bg-gray-100 border">
<p>Description content</p>
</div>

```javascript
console.log('Custom description slot')
```

</template>

</OAOperation>

:::

## WIP

