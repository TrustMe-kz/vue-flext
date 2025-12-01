# Vue Flext

Instructions for AI agents working with the repository.

---

## 0) Quick facts about this repository

* Purpose: a Vue 3 wrapper around the **FlextDoc DSL** – it renders Handlebars-like templates, exposes metadata-driven forms, and streams CSS/A4 output directly inside Vue applications
* Stack: `TypeScript`, `Vue 3`, `Vite`, `@trustme24/flext`, `UnoCSS/Tailwind`, `vue-a4`
* Core entities:
    * `Flext` component (`src/Component.vue`) — orchestrates the layout, forwards props, manages v-model, and exposes slots
    * `components/Document.vue` — owns the Flext instance, watches template/modules/data, renders HTML/CSS/sandbox/paged output
    * `components/Fields.vue` (+ `FieldsCard`, `FieldsRadioRange`) — rebuilds forms from `flext.model`, maps nodes into cards/groups/fields
    * Utilities/types: `lib.ts` (`has` guard), `types.ts` (Obj/Nullable definitions), `errors.ts`, default CSS tokens (`index.css`)
* Structure overview:
    * `src/` — SFCs, helper utilities, CSS, shims
    * `dist/` — compiled bundles (`index.es.js`, `index.d.ts`, `vue-flext.css`)
    * `test/app/` — Vite playground to verify integration scenarios
* Build:
    * Bundled with Vite (ESM + CSS) and typed via `vue-tsc`
* Scripts:
    * `npm run build` — default pipeline (Vite build + `vue-tsc`)
    * `npm run build:types` — types only
    * `npm run lint` — ESLint + Vue parser
    * `npm run test:app` — builds the lib and runs the demo Vite app (installs deps before launching)
    * `npm run start:test-app` — runs the demo app dev server (assumes deps already installed)

> Agents: before making changes, read `README.md`, `package.json`, the exported typings in `dist/index.d.ts`, and skim `test/app/src` to understand integration expectations.

---

## 1) Agent protocol

1. **Understand the task**
    * Write a concise plan (3–7 steps) and keep it updated as you progress
2. **Minimal diff**
    * Touch only the files required for the fix/feature  
      ❌ No sweeping refactors, formatting drives, or dead-code removal unless part of the task
3. **Maintain public API stability**
    * Preserve component props (`template`, `modules`, `paged`, etc.), emitted events, and slot contracts unless an approved breaking change is requested
4. **DSL is the source of truth**
    * The Vue layer defers to Flext core (`@trustme24/flext`). Do not change directive parsing, helper semantics, or metadata assumptions unless the upstream core is updated in lockstep
5. **Tests and build**
    * Run `npm run build` (and `npm run test:app` when behavior impacts integration) before handing off
6. **Documentation**
    * Update README, examples, prop tables, and slot descriptions whenever functionality changes or new props/events are introduced

---

## 2) Architecture and code placement

### 2.1. Flext component layout (`src/Component.vue`)

Responsible for:

* Owning public props (template, modules, v-model, sandbox/paged/error/noTheme toggles, radio labels)
* Defining emits: `render`, `cssRender`, `dataModel`, `change`, `update:modelValue`
* Creating a controlled `val` computed for v-model and forwarding updates down to `<Fields>`
* Rendering the column layout (Document + Fields) and exposing slots (`document`, `fields`, `content`, `paged`, `sandbox`, `errors`, `field` variations, etc.)

Requirements:

* Keep prop defaults aligned with README and types
* Always forward slots/emits consistently — new slots must be documented and remain backward compatible
* When passing props to child components, avoid renaming keys or mutating props (Vue 3 rules still apply under script-setup)
* Styling lives in scoped blocks inside components; avoid global overrides unless routed through `index.css`

### 2.2. Document pipeline (`components/Document.vue`)

Responsible for:

* Instantiating `new Flext(template)` from `@trustme24/flext`
* Watching `template`, `modules`, and `value` props to rebuild AST, HTML, CSS, and metadata model
* Emitting render/cssRender/dataModel events and exposing error lists
* Managing sandbox rendering through shadow DOM and CSS injection (`sandboxPreview`, `CSS_FIX_STYLES`), plus optional paged rendering via `vue-a4`
* Maintaining error resilience with `onErrorCaptured`, `errors[]`, and guard logs

Requirements:

* `setTemplate` is the hub: it must reset errors, call `setTemplate`/`setData`, refresh `html`, `model`, and `css`. Any new features tied to template parsing or CSS injection belong here
* Do not bypass watchers: `modules` watcher loops through `has()` to register helpers; `value` watcher must stay defensive (null checks) to avoid crashing when the host code toggles v-model quickly
* Sandbox mode must never leak styles outside of the shadow root; keep CSS updates within `sandboxPreviewCss`
* Keep asynchronous flows awaited; watchers return promises, so handle errors to avoid unhandled warnings

### 2.3. Fields builder (`components/Fields.vue`)

Responsible for:

* Recomputing metadata-driven cards by running `new Flext().setTemplate(template).model`
* Converting metadata nodes into cards/groups/fields (`objToField`, `objToGroup`, `objToCard`, `arrToCards`) with `onUpdate` callbacks wired back into `modelValue`
* Handling input rendering (text/number/boolean) with slot overrides (`numericField`, `booleanField`, `field`, `before/after/noContent`)
* Validating required fields (`isFieldValid`, `isFieldError`) and surfacing errors when `error` prop or blur events trigger

Requirements:

* Keep conversions pure: helper functions should not mutate incoming metadata nodes; they should create new objects and track `extra` state for UI use only
* Always respect Vue reactivity – clone objects before emitting (`{ ...this.modelValue, ...data }`) so v-model picks up changes
* If new field types or widgets are added, include slot fallbacks and update README/test app to show usage
* Avoid repeated Flext instantiations in watchers; reuse computed `model` but ensure template changes propagate (current watch on `model` handles it)

### 2.4. Supporting utilities, CSS, and exports

* `index.ts` re-exports `<Flext>`, `<FlextDocument>`, `<FlextFields>` and imports `index.css`; keep exports tree-shake friendly
* `index.css` + scoped styles define the default look (layout, field inputs, colors). Additions must keep `noTheme` handling intact and avoid leaking globals
* `lib.ts`, `errors.ts`, and `types.ts` house commonly reused helpers. Reuse them instead of duplicating logic inside components
* Sub-components such as `FieldsCard.vue` and `FieldsRadioRange.vue` exist only to structure the UI; keep them lightweight and stateless

### 2.5. Integration playground (`test/app`)

* The demo Vite app exercises the component API (props, modules, slots, paged mode)
* Use it to verify changes manually: `npm run test:app` builds the library into `dist/`, installs demo deps, then runs its scripts
* Code in `test/app/src` acts as public documentation. When adding props or slots, reflect them here

### 2.6. Build outputs & packaging

* `dist/index.es.js` is the ESM bundle consumed by apps; never edit it manually
* `dist/index.d.ts` exposes component typings. Regenerate via `npm run build:types` after changing TS interfaces
* `dist/vue-flext.css` holds compiled CSS. Keep source-of-truth styles in `src/index.css` to avoid drift
* The package exports default + named exports; changing entry points requires updating `package.json` exports and ensuring consumers of `vue-flext/index.css` remain unaffected

---

## 3) Code style

Vue Flext follows the same direct, explicit style as Flext Core:

* One function/component — one responsibility
* Prefer **early returns** instead of deep nesting
* Function size target: **≤40–60 lines**
* Nesting depth: **≤3 levels**
* Prefer named helpers over long inline callbacks
* When editing Vue SFCs, align `<script>`, `<template>`, and `<style>` blocks, specify `lang="ts"`, and keep imports grouped (Vue, external, internal)

### 3.1. General principles

* Validate inputs first — guard clauses should explain why they bail out
* Collect data next — assign locals instead of repeatedly reading props/refs
* Define helper functions close to their use; keep them pure
* Execute the main flow with clear sections delimited by the comment markers below

### 3.2. Naming rules

* **Data --> nouns:** `cards`, `fields`, `model`, `options`, `errors`
* **Actions --> verbs:** `setTemplate`, `sandboxPreview`, `objToCard`, `applyModules`
* Avoid unclear abbreviations; pick names users recognize from props/events
* No humorous names — this library ships to production SaaS apps

### 3.3. Function structure pattern

Keep the “checks --> data --> helpers --> main flow” structure. Example from `Document.vue`:

```ts
sandboxPreview(html: string, css?: string|null): void {

    // Doing some checks

    if (!this.sandboxRoot) {
        console.warn('Flext: Unable to render the document: The sandbox is not ready yet');
        return;
    }


    // Rendering the document

    this.sandboxPreviewCss(css ?? '');

    this.sandboxRoot.innerHTML = html;
}
```

### 3.4. Breaking down “fat” functions

Large watchers or methods should be decomposed. Example pattern for mapping metadata nodes:

```ts
objToGroup(val: Obj, onUpdate: GroupUpdateHandler | null = null): Group {

    // Doing some checks

    const name = val?.name ?? null;
    const nodes = val?.$ ?? [];


    // Getting the data

    const label = val?.label ?? name ?? null;
    const fields: Field[] = [];
    const data: Obj = {};


    // Defining the functions

    const onFieldUpdate = (fieldName: string) => (value: any) => {
        data[fieldName] = value;
        onUpdate?.(data);
    };


    // Getting the group

    if (!nodes?.length) {
        const field = this.objToField(val, onFieldUpdate(name ?? ''));
        return { name, label, fields: [field], isRequired: !!field?.isRequired, onUpdate };
    }

    for (const node of nodes) {
        const field = this.objToField(node, onFieldUpdate(node?.name ?? ''));
        fields.push(field);
    }


    return { name, label, fields, isRequired: fields.every(f => f.isRequired), onUpdate };
}
```

### 3.5. Comments

Comments should explain **why**, not the syntax. Use these markers consistently:

* `// Constants`
* `// Variables`
* `// Doing some checks`
* `// Getting the data`
* `// Defining the functions`
* `// TODO: username:` — planned improvement
* `// FIXME: username:` — known issue

Example:

```ts
// TODO: kr: Ensure modules are re-registered when the object reference changes
watch(() => props.modules, (val) => {

    // Doing some checks

    if (!val) return;


    // Getting the data

    const entries = Object.entries(val);


    // Applying the modules

    for (const [ name, modul ] of entries)
        flext.value?.addModule(name, module);
}, { immediate: true, deep: true });
```

---

## 4) Data model & validation

* The Vue layer never rebuilds parsing logic — it calls into `@trustme24/flext` to get `model`, `html`, `css`, and validation behavior
* `Document.vue` obtains `flext.model` to emit `dataModel`; `Fields.vue` re-derives cards from `new Flext().setTemplate(template).model`. These paths must stay coordinated so slots receive the same metadata users see via `@dataModel`
* Depth limits (`DEFAULT_MODEL_DEPTH`) and safety errors (`PotentialLoopError`) surface from Flext core; do not swallow them. Errors get displayed through the `errors`/`error` slots
* When modifying metadata-to-form mapping, test deeply nested data, repeated groups, optional nodes, helper-name collisions, and boolean defaults. Update the demo app to cover new cases
* Keep validation stateless: `isFieldValid`/`isFieldError` should stay pure and only rely on provided props/state
* Do not remove error paths in watchers (`value`, `templateVal`, etc.); they guard against infinite loops on invalid templates

---

## 5) Component API and usage examples

Public contract:

* **Props:** `template`, `modules`, `modelValue` (v-model), `sandbox`, `paged`, `error`, `disabled`, `noTheme`, `radioYesLabel`, `radioNoLabel`
* **Events:** `render`, `cssRender`, `dataModel`, `change`, `update:modelValue`
* **Slots:** `document`, `fields`, `errors`, `error`, `content`, `paged`, `sandbox`, `noContent`, plus field slots (`beforeFields`, `afterFields`, `field`, `numericField`, `booleanField`, `noFields`)

Examples in docs and the `test/app` project form part of the public contract. If behavior changes, update them immediately.

Recommended minimal example:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref(`
  {{!-- @v "1.0.beta3" --}}
  {{!-- @use "put" --}}

  <p>Hello, {{ put data.user.name "Guest" }}!</p>
`);

const data = ref({ data: { user: { name: 'Anna' } } });
</script>

<template>
  <Flext
      :template="template"
      v-model="data"
      @render="html => console.log(html)"
  />
</template>
```

Additional Vue 3 example with modules + slots:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Flext from 'vue-flext';

const template = ref(`
  {{!-- @v "1.0.beta3" --}}
  {{!-- @use "put" "match" --}}
  {{!-- @field "contract.status"  type="string" label="Статус"   required --}}
  {{!-- @field "contract.manager" type="string" label="Менеджер" --}}

  <section class="space-y-2">
    {{#match contract.status}}
      {{#match:case "ok"}}<span class="text-green-600">Approved</span>{{/match:case}}
      {{#match:fallback}}<span class="text-red-500">Pending</span>{{/match:fallback}}
    {{/match}}

    <div>Manager: {{ put contract.manager "—" }}</div>
  </section>
`);

const data = ref({ contract: { status: 'ok', manager: '' } });

const onDataModel = (model) => console.log('model', model);
</script>

<template>
  <Flext
    :template="template"
    :modules="modules"
    v-slot="{ html }"
    v-model="data"
    @dataModel="onDataModel"
    paged
  >
    <article v-html="html" class="rounded border p-6 shadow-sm" />

    <template #fields="{ field, value, error }">
      <label class="flex flex-col gap-1">
        {{ field?.label }}

        <input
          class="border rounded px-3 py-2"
          :value="value"
          :class="{ 'border-red-500': error }"
          @input="e => field?.onUpdate?.(e?.target?.value ?? '')"
        />
      </label>
    </template>
  </Flext>
</template>
```

---

## 6) Prohibitions & caution

* ❌ Don’t change directive formats or helper semantics — those belong to Flext Core
* ❌ Don’t mutate props directly or bypass Vue’s reactivity helpers; always emit fresh objects
* ❌ Don’t remove guards around sandbox/paged rendering; CSS must stay scoped to the shadow root or paged component
* ❌ Don’t register helpers implicitly; `modules` prop must stay explicit to avoid bloating bundles
* ❌ Don’t import heavy dependencies into the runtime bundle without approval
* ❌ Don’t silence warnings/errors (`BaseWarning`, `BaseError`, `PotentialLoopError`); expose them via the error slots
* ❌ Don’t edit files in `dist/` manually — regenerate via the build pipeline

---

## 7) Pre-commit checklist

* [ ] Task completed according to the agreed plan
* [ ] Component props, emits, and slots remain backward compatible (or breaking changes were approved and documented)
* [ ] Metadata parsing and module handling still defer to Flext core; no hidden state added
* [ ] README/docs/test app updated for any new props, slots, or behaviors
* [ ] Code style follows the established pattern (checks --> data --> helpers --> main flow)
* [ ] `npm run build` succeeds; run `npm run test:app` when UI behavior changed
* [ ] No manual edits in `dist/`; artifacts come from the build
