## Vue Flext

[![Static Badge](https://img.shields.io/badge/GitHub-Star%20%281%29-yellow?logo=github)](https://github.com/TrustMe-kz/vue-flext)
[![Static Badge](https://img.shields.io/badge/NPM-Download%20%28379%29-blue)](https://www.npmjs.com/package/vue-flext)
[![Static Badge](https://img.shields.io/badge/CodeSandbox-Preview%20%2820%29-black)](https://codesandbox.io/p/devbox/vue-flext-h7fk8r)

**Vue Flext** is a lightweight wrapper around [Flext](https://www.npmjs.com/package/@trustme24/flext). It compiles Handlebars‑like templates with a small set of macros and modules and exposes the result through a simple Vue component. The library ships with ESM and UMD bundles.

- [Demo: Available at CodeSandbox](https://codesandbox.io/p/devbox/vue-flext-h7fk8r)
- [Documentation: Available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/NTYzY2Y3NTgxNDczNDhiMGEwZjU5ODFiYTJlYWM4ZGY)

[Vue Flext is maintained by TrustMe](https://trustme24.com/).

### Example
```vue
<script setup lang="ts">
  
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref(`
  {{!-- @v "1.0.beta3" --}}
  {{!-- @use "put" --}}

  <div class="text-center text-red-500">{{ put data.helloWorld 'No hello world...' }}</div>
`);

const data = ref({ helloWorld: 'Hello World!' });

</script>

<template>
  <Flext :template="template" v-model="data" />
</template>
```

## Installation

1. Install **dependencies**:

```shell
npm i vue-flext tailwindcss @trustme24/flext
```

2. Add the **CSS** import in your CSS file:

```css
@import "vue-flext/index.css";
```

3. **You're all set!**

---
**Vue Flext by Kenny Romanov**  
TrustMe
