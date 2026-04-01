# Vue Flext

[![Static Badge](https://img.shields.io/badge/GitHub-Star%20%281%29-yellow?logo=github)](https://github.com/TrustMe-kz/vue-flext)
[![Static Badge](https://img.shields.io/badge/NPM-Download%20%283052%29-blue)](https://www.npmjs.com/package/vue-flext)
[![Static Badge](https://img.shields.io/badge/CodeSandbox-Preview%20%2859%29-black)](https://codesandbox.io/p/devbox/vue-flext-h7fk8r)

![trustme24_flext_cover.jpg](https://raw.githubusercontent.com/TrustMe-kz/vue-flext/21ef1a6cf2a256658370454644e8e427ce100cd6/docs/trustme24_flext_logo_cover.jpg)

**Vue Flext** is a technology for building reliable document interfaces in Vue.

In many systems, document previews start simple and gradually become fragile: form state drifts away from the rendered document, rendering logic spreads across components and composables, versions break compatibility, and debugging becomes difficult. Vue Flext addresses this problem by bringing Flext templates into Vue as reactive, self-describing document artifacts.

A Vue Flext template can contain Markup, Metadata, Modules, and rendering hints in a single artifact, while Vue handles state, composition, and interaction around it. This makes document templates easier to reuse, validate, preview, and embed into larger systems such as admin panels, document pipelines, reporting services, or contract generation platforms.

* [GitHub: TrustMe-kz/vue-flext](https://github.com/TrustMe-kz/vue-flext)
* [NPM: vue-flext](https://www.npmjs.com/package/vue-flext)
* [Demo: Available at CodeSandbox](https://codesandbox.io/p/devbox/vue-flext-h7fk8r)
* [Documentation: Available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/NTYzY2Y3NTgxNDczNDhiMGEwZjU5ODFiYTJlYWM4ZGY)

---

## Installation

```shell
npm i vue-flext tailwindcss @trustme24/flext
```

Add the **CSS** import:

```css
@import "vue-flext/index.css";
```

🎉 **That's It!**

---

## The Problem

Document templating often looks simple at first. Over time it tends to accumulate hidden complexity.

Typical issues include: duplicated logic between forms and document previews, undocumented fields, incompatible template versions, fragile helper usage, and weak validation before rendering.

![trustme24_flext_abstract_painting.jpg](https://raw.githubusercontent.com/TrustMe-kz/vue-flext/21ef1a6cf2a256658370454644e8e427ce100cd6/docs/trustme24_flext_abstract_painting.jpg)

### A few common scenarios illustrate the problem:

1. **A document preview depends on fields that are edited elsewhere in the interface. The result is either broken output or a constant need for manual synchronization.**
   Solution with Vue Flext: The template can explicitly declare required fields using Metadata, while Vue Flext keeps the rendered document reactive to data changes.

————————————

2. **Multiple screens or components use the same template but apply different helper logic or formatting rules.**
   Solution with Vue Flext: Templates can declare Module dependencies so rendering logic is predictable and consistent across the application.

————————————

3. **Templates evolve but older workflows still rely on previous versions.**
   Solution with Vue Flext: Templates can carry explicit Version information and compatibility rules.

---

## What It Provides

**Vue Flext** builds on top of [Flext](https://www.npmjs.com/package/@trustme24/flext) and keeps its familiar syntax while exposing it through a Vue component. The goal is not to replace Vue components or existing template engines but to make document-driven interfaces safer and easier to maintain.

Instead of treating templates as plain text files or scattering document logic across multiple components, Vue Flext treats them as structured artifacts rendered inside Vue. A template can include Markup, Metadata directives, and Module dependencies, all stored together and kept reactive through standard Vue patterns such as `v-model`, props, events, and slots.

This approach helps systems understand what a template requires before rendering it, while still fitting naturally into Vue applications.

### Quick Start:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref(`
  {{!-- @syntax "1.0" --}}
  {{!-- @use "put" --}}
  <p>{{ put data.name 'Unknown user...' }}</p>
`);

const data = ref({
  name: 'Anna',
});
</script>

<template>
  <Flext :template="template" v-model="data" />
</template>
```

---

## Core Ideas

A **Vue Flext** template contains three conceptual layers. The first layer is markup: HTML and standard Handlebars expressions. The second layer is Metadata written as directives such as `@syntax`, `@field`, or `@use`. The third layer is runtime behavior provided through Modules and helpers.

Vue Flext adds a fourth practical layer: reactive integration with Vue. The template remains a self-contained artifact, while Vue manages state updates, component composition, user input, and application-level interaction around it.

Keeping these elements close together makes templates easier to move between systems and reduces hidden assumptions.

Metadata directives can describe template Version, language, title, rendering parameters, and required fields. Modules provide reusable logic such as formatting numbers, inserting fallback values, or conditional rendering.

### Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref(`
  {{!-- @syntax "1.0" --}}
  {{!-- @use "put" --}}
  {{!-- @group "data" --}}
  {{!-- @field "data.someField" type="string" label="Hello World" required --}}

  <p class="text-center">
    {{ put data.someField 'No hello world...' }}
  </p>
`);

const data = ref({
  someField: 'Hello World!',
});
</script>

<template>
  <Flext :template="template" v-model="data" />
</template>
```

> 💡 **In this example** the template carries additional information: Version, Field definition, and Module usage. This allows runtime tools to build a Data Model, validate input, and render HTML predictably inside a Vue application.

---

## Use Cases

![trustme24_flext_use_cases.jpg](https://raw.githubusercontent.com/TrustMe-kz/vue-flext/21ef1a6cf2a256658370454644e8e427ce100cd6/docs/trustme24_flext_use_cases.jpg)

**Vue Flext** is intended for structured document rendering inside Vue applications. Common examples include contracts, invoices, reports, certificates, preview editors, and internal document workflows. It is particularly useful when templates must be versioned, validated, reused across screens or services, or rendered as live previews in reactive interfaces.

Vue Flext can be used on its own, but it is also designed to serve as the UI layer inside a larger document ecosystem. Related tools include [Flext](https://www.npmjs.com/package/@trustme24/flext) as the core engine, [flext2pdf](https://www.npmjs.com/package/flext2pdf) for HTML‑to‑PDF rendering, and some **Flext Convert Service** for running document rendering as a microservice.

Together these components allow Flext to power full document pipelines while Vue Flext remains a lightweight interface layer for browser-based authoring and preview.

---

## Writing Templates

Templates should stay declarative and focused on layout. Business logic is usually better handled in Modules, composables, or application code. Metadata directives such as `@field` help document required data and make validation possible.

### Example:

```handlebars
{{!-- @syntax "1.0" --}}
{{!-- @use "put" "date" --}}
{{!-- @group "data" --}}
{{!-- @field "data.city" type="string" label="City" required --}}
{{!-- @field "data.date" type="date"   label="Date" required --}}

<p>
  {{ put data.city "City" }}, {{ put (date:text data.date "No date...") }}
</p>
```

### Best Practices

Treat templates as versioned artifacts. Prefer explicit metadata over hidden assumptions. Keep helper usage predictable and document important data paths with `@field`. Test templates with realistic data and separate document layout from application business rules.

### Limitations

Vue Flext is intentionally focused. It is not a full programming language, not a WYSIWYG editor, and not a complete document management system. Its role is to act as a reliable document interface layer inside Vue-based document generation workflows.

---

## API

The main entry point is the `Flext` Vue component.

### Basic Usage:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref('...');
const data = ref({});
</script>

<template>
  <Flext :template="template" v-model="data" />
</template>
```

Vue Flext also exposes events, slots, paged rendering options, and access to rendered HTML, CSS, and generated data models.

[More information about the API is available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/NTYzY2Y3NTgxNDczNDhiMGEwZjU5ODFiYTJlYWM4ZGY).

---

## Architecture

**Vue Flext** operates as a simple pipeline.

```text
Template
  v
Flext Parser / AST
  v
Directives / Modules
  v
Vue Rendering / Reactivity
  v
Preview / Data Model / Export
```

At runtime Vue Flext passes the template through Flext, extracts Metadata, registers Modules, builds a Data Model, and generates preview. Vue then reacts to state changes, updates the rendered document, and exposes the result to the surrounding application. The output can then be passed to other tools to display, store, or generate PDF.

* [Repo: More information about the core repo can be found in Flext ARCHITECTURE.md](https://github.com/TrustMe-kz/vue-flext/blob/main/ARCHITECTURE.md)
* [Documentation: More information about the API is available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/NTYzY2Y3NTgxNDczNDhiMGEwZjU5ODFiYTJlYWM4ZGY)

---

## Development

```shell
npm run test:app
```

Run **Tests**:

```shell
npm run test
```

[More information about contribution can be found in CONTRIBUTING.md](https://github.com/TrustMe-kz/vue-flext/blob/main/CONTRIBUTING.md).

---

## Roadmap

Future development focuses on improving reliability and adoption. Planned areas include stronger template validation, better Vue integration patterns, richer preview workflows, clearer compatibility rules, improved authoring experience, richer documentation, ecosystem integrations, editor support, and example-driven regression testing.

![trustme24_flext_abstract_painting.jpg](https://raw.githubusercontent.com/TrustMe-kz/vue-flext/21ef1a6cf2a256658370454644e8e427ce100cd6/docs/trustme24_flext_abstract_painting.jpg)

* **Contributions** are welcome. Useful areas include documentation, example templates, Vue integration patterns, slots and rendering improvements, ecosystem tooling, performance optimizations, and test coverage. Changes that affect the template syntax or core semantics should first be discussed in issues so architectural decisions remain consistent.

————————————

* **Governance:** Vue Flext is maintained by [TrustMe](https://trustme24.com/). External contributions are encouraged while core design decisions remain centralized to keep the language and runtime coherent.

————————————

* **Security:** If you discover a security issue, please report it privately to [i.am@kennyromanov.com](mailto:i.am@kennyromanov.com) instead of opening a public issue.

————————————

* **License:** Vue Flext is released under the [MIT License](https://github.com/TrustMe-kz/vue-flext/blob/main/LICENSE)

---

**Vue Flext by Kenny Romanov**  
TrustMe
