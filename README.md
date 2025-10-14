## Vue Flext

[![Static Badge](https://img.shields.io/badge/GitHub-Star%20%281%29-yellow?logo=github)](https://github.com/TrustMe-kz/vue-flext)
[![Static Badge](https://img.shields.io/badge/NPM-Download%20%28379%29-blue)](https://www.npmjs.com/package/vue-flext)

**Vue Flext** is a lightweight wrapper around [Flext](https://www.npmjs.com/package/@trustme24/flext) for Vue. It compiles Handlebars‑like templates with a small set of macros and modules and exposes the result through a simple Vue component. The library ships with ESM and UMD bundles.

Public documentation is available at [Wiki](https://trustmekz.atlassian.net/wiki/external/NTYzY2Y3NTgxNDczNDhiMGEwZjU5ODFiYTJlYWM4ZGY).

Vue Flext is maintained by [TrustMe](https://trustme24.com/).

### Example
```vue
<script setup lang="ts">
import Flext from 'vue-flext';

const template = `
  {{!-- @v "1.0.beta2" --}}
  {{!-- @use "put" --}}

  <div class="text-center text-red-500">{{ put data.helloWorld 'No hello world...' }}</div>
`;
const data = { helloWorld: 'Hello World!' };
</script>

<template>
  <Flext :template="template" v-model="data" />
</template>
```

## Installation

1. Install **dependencies**:

```shell
npm i tailwindcss vue-flext
```

2. Add the **CSS** import in your CSS file:

```css
@import "vue-flext/index.css";
```

3. **You're all set!**

---
**Vue Flext by Kenny Romanov**  
TrustMe
