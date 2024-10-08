# Getting Started

This guide will walk you through the steps to set up and use the `vitepress-theme-openapi` in your VitePress project.

## Demo

- [DolarApi.com](https://dolarapi.com/)
- [ArgentinaDatos](https://argentinadatos.com/)
- [CriptoYa API](https://docs.criptoya.com/)

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js
- VitePress
- OpenAPI Specification (Version 3)

## Installation

To install the theme in your VitePress project, run one of the following commands depending on your preferred package
manager:

```bash
npm install vitepress-theme-openapi

pnpm add vitepress-theme-openapi

yarn add vitepress-theme-openapi

bun install vitepress-theme-openapi
```

## Usage

### OpenAPI Specification

Place your OpenAPI specification in the public directory. For example, `public/openapi.json`.

### Theme Configuration

In your `.vitepress/theme/index.js`, import the theme and configure it as follows:

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import { theme, useOpenapi, useTheme } from 'vitepress-theme-openapi'
import 'vitepress-theme-openapi/dist/style.css'

import spec from '../../public/openapi.json' assert { type: 'json' }

export default {
    ...DefaultTheme,
    async enhanceApp({app, router, siteData}) {
        // Set the OpenAPI specification.
        const openapi = useOpenapi()
        openapi.setSpec(spec)

        // Optionally, configure the theme.
        const themeConfig = useTheme()
        themeConfig.setLocale('en') // en or es

        // Use the theme.
        theme.enhanceApp({app})
    }
} satisfies Theme
```

### Layouts

You can render the OpenAPI specification in different layouts:

- [One operation per page](/layouts/one-operation.html)
- [All operations in a single page](/layouts/all-operations.html)
- [Sidebar items](/layouts/sidebar.html)
