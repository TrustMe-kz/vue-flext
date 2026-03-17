# Architecture — Flext

[< README.md](https://github.com/TrustMe-kz/vue-flext/blob/main/README.md)

![trustme24_flext_cover.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext/ae3284e6156dd8b18e1998084943636e50cd64a2/docs/trustme24_flext_logo_cover.jpg)

This document explains how **Vue Flext** is built internally.

Its purpose is simple: If you open the repository and want to make a change, this file should help you quickly answer two questions:

* Where should this change be made
* Why is the code organized this way

> 💡 **This is not a user guide.** It is an architecture guide for contributors and maintainers.

---

## 1. Vue Flext at the Architecture Level

**Vue Flext** is a Vue 3 wrapper around `@trustme24/flext`.

The core library remains responsible for template parsing, metadata extraction, model generation, and HTML/CSS output. This repository is responsible for the Vue side: reactive state flow, component composition, slots, form rebuilding, sandboxed preview, and packaged integration for applications.

At a high level, Vue Flext does four things: it connects templates to Vue reactivity, exposes rendered output as components and slots, rebuilds form controls from the Flext model, and keeps the public component API stable for host apps.

Vue Flext does **not** try to replace the core parser, invent a second template language, or move business logic into the wrapper.

---

## 2. Main Flow

**Vue Flext** works as a wrapper pipeline around the core runtime.

```text
Vue Props
  v
Component.vue
  v
Document.vue / Fields.vue
  v
@trustme24/flext
  v
HTML / CSS / Data Model
  v
Slots / Events / Preview / Form State
```

This flow matters because most changes belong to one stage.

#### A few practical examples:

* If the change affects public props, slot contracts, or emitted events, it belongs to `src/Component.vue`
* If the change affects document rendering, sandbox output, CSS injection, or paged preview, it belongs to `src/components/Document.vue`
* If the change affects generated form cards, field widgets, or `v-model` updates, it belongs to `src/components/Fields.vue`
* If the change affects template parsing semantics, it usually belongs to `@trustme24/flext`, not to this repository

---

## 3. Repository Structure

The repository is split into a few clear areas.

* `src/` contains the source code of the Vue wrapper
* `src/components/` contains the rendering and fields components
* `dist/` contains generated build artifacts published to consumers
* `test/app/` contains the demo Vite app used as an integration check

#### If you are new to the codebase, the usual reading order is:

1. **Readme:** [Go to README.md](https://github.com/TrustMe-kz/vue-flext/blob/main/README.md)
2. **Package:** [Go to package.json](package.json)
3. **Types:** [Go to dist/index.d.ts](dist/index.d.ts)
4. **Entry:** [Go to src/index.ts](src/index.ts)
5. **Main Component:** [Go to src/Component.vue](src/Component.vue)
6. **Document Pipeline:** [Go to src/components/Document.vue](src/components/Document.vue)
7. **Fields Builder:** [Go to src/components/Fields.vue](src/components/Fields.vue)
8. **Demo App:** [Go to test/app/src](test/app/src)

> ⚠️ **Source of truth** is always `src/`. Do not edit `dist/` manually.

---

## 4. Main Architectural Layers

Vue Flext is easier to understand if you think in wrapper layers.

### 4.1 Public Component Layer

This layer lives in `src/Component.vue`.

It owns the public props, emits, slot forwarding, and the layout that combines document preview with generated fields. This is the stable surface consumers work with.

### 4.2 Document Integration Layer

This layer lives in `src/components/Document.vue`.

It creates the Flext instance, reacts to template and data changes, generates HTML and CSS, exposes the data model, and decides how preview should be rendered: plain HTML, shadow-root sandbox, or paged mode through `vue-a4`.

### 4.3 Fields Integration Layer

This layer lives in `src/components/Fields.vue`.

It rebuilds UI controls from the metadata model returned by Flext. It maps model nodes into cards, groups, and fields, then emits fresh objects back through Vue `v-model`.

### 4.4 Styling and Packaging Layer

This layer lives in `src/index.ts`, `src/index.css`, and the build output.

It controls what gets exported, which CSS is loaded by default, and how consumers import the library in real Vue apps.

---

## 5. Main Components

Three components define almost all runtime behavior in this repository: `Flext`, `FlextDocument`, and `FlextFields`.

### 5.1 `Flext`

`src/Component.vue` is the main public component.

It does not parse templates itself. Its job is orchestration. It receives props such as `template`, `modules`, `modelValue`, `sandbox`, `paged`, `error`, `disabled`, and `noTheme`. Then it connects `Document` and `Fields`, forwards slots, and keeps the `v-model` contract centered in one place.

This component is the public shell of the library. If a change affects how consumers embed Vue Flext, start here.

### 5.2 `FlextDocument`

`src/components/Document.vue` owns the document pipeline.

It keeps a live Flext instance, watches template/data/module changes, updates `html`, `css`, and `dataModel`, catches runtime errors, and renders output through the appropriate preview mode.

This is the runtime bridge between the Vue wrapper and the Flext core.

### 5.3 `FlextFields`

`src/components/Fields.vue` owns form generation.

It creates cards, groups, and fields from the Flext model. Then it wires updates back into `modelValue` through fresh object emits. It also handles default widgets for numbers, booleans, objects, arrays, dates, and mixed fields, while still exposing slots for overrides.

This is the form-facing half of the wrapper.

### 5.4 Why the Split Exists

The split is intentional.

`Flext` keeps the public API and layout simple. `FlextDocument` focuses on rendering. `FlextFields` focuses on metadata-to-form mapping. This avoids mixing preview logic, state syncing, and field UI in one large component.

Do not merge these responsibilities casually. The split keeps the wrapper readable.

---

## 6. `Document.setTemplate` is the wrapper lifecycle center

If a feature is driven by template contents inside Vue Flext, `setTemplate` in `Document.vue` is usually the first place to inspect.

This method resets the runtime output and rebuilds the current document state from the latest template and data. It calls into Flext, then stores the results in Vue state: `html`, `dataModel`, and `css`.

#### Typical sequence:

1. Reuse the current Flext instance
2. Call `setTemplate`
3. Call `setData`
4. Read rendered `html`
5. Read generated `model`
6. Await generated `css`

> 💡 **This makes** `setTemplate` the lifecycle center of the document wrapper.

**Architectural pattern:** template-driven behavior should enter the Vue layer through the document pipeline, not through side effects spread across components.

**Do not do this:** add template-dependent state updates in unrelated watchers and leave `html`, `css`, and `dataModel` out of sync.

---

## 7. Reactive Flow

Vue Flext depends on watchers more than on one large imperative runtime.

That is by design. The wrapper reacts to changing props and keeps the preview and form state aligned with those props.

### 7.1 Main Reactive Sources

The most important reactive inputs are:

* `template`
* `modules`
* `modelValue` / `value`
* sandbox element readiness

### 7.2 Main Reactive Outputs

The most important derived outputs are:

* `html`
* `css`
* `dataModel`
* `cards`
* emitted `render`, `cssRender`, `dataModel`, `change`, and `update:modelValue`

### 7.3 Why this matters

The wrapper is not just a render call. It is a small reactive system. If one watcher stops updating correctly, the preview, fields, and emitted events can drift apart.

**Do not do this:** update one output directly and assume the rest will stay correct automatically.

---

## 8. Public API as a Contract

**The public API** is not only a convenience layer. It is an architectural contract.

#### Important public props include:

* `template`
* `modules`
* `modelValue`
* `sandbox`
* `paged`
* `error`
* `disabled`
* `noTheme`
* `radioYesLabel`
* `radioNoLabel`

#### Important public events include:

* `render`
* `cssRender`
* `dataModel`
* `change`
* `update:modelValue`

#### Important public slots include:

* `document`
* `fields`
* `content`
* `paged`
* `sandbox`
* `errors`
* `error`
* field slots such as `field`, `numericField`, `booleanField`, `objectField`, `arrayField`, `dateField`, and `mixedField`

These contracts should stay predictable. If internal refactoring changes behavior, it must preserve the external shape unless a breaking change is explicitly planned.

Examples in docs and `test/app` are part of this contract too.

**Do not do this:** change prop names, emit payloads, or slot props quietly and hope consumers will adapt.

---

## 9. Document Rendering Architecture

`Document.vue` is where Vue Flext turns core output into browser-visible output.

### 9.1 Main Responsibilities

This component is responsible for:

* creating and keeping the Flext instance
* applying custom modules from the `modules` prop
* rendering HTML
* generating CSS
* exposing the generated data model
* catching runtime errors
* choosing one of three output modes: plain HTML, sandbox preview, or paged preview

### 9.2 Output Modes

The component supports three practical rendering paths:

* plain output through `v-html`
* sandbox output through a shadow root
* paged output through `vue-a4`

This split exists because document previews often need isolation. Raw CSS from templates should not leak into the host page when sandbox mode is enabled.

### 9.3 Sandbox Design

Sandbox mode is implemented with `attachShadow`, a dedicated style node, and a dedicated root node. CSS is written into the shadow root through `sandboxPreviewCss`, and HTML is injected into the shadow root through `sandboxPreview`.

This is a hard boundary in the wrapper. It protects host styles and keeps template styles local.

**Do not do this:** inject sandbox CSS into the main document head. That breaks the whole point of sandbox mode.

---

## 10. Fields Architecture

`Fields.vue` is the part of Vue Flext that turns metadata into form controls.

It does not invent its own schema. It asks Flext for the model and maps the result into a UI structure that Vue can render easily.

### 10.1 Main Steps

The fields layer works roughly like this:

1. Build the Flext model from the template
2. Convert model nodes into cards
3. Convert card nodes into groups
4. Convert group nodes into fields
5. Attach `onUpdate` handlers at each level
6. Emit a fresh merged object through Vue `v-model`

### 10.2 Why Cards, Groups, and Fields Exist

The extra UI structure is intentional.

The raw Flext model is useful, but it is not yet a clean rendering structure for a form. Vue Flext adds a form-oriented shape so slots and default widgets can work with stable, predictable data.

### 10.3 Validation Approach

Validation in the fields layer is lightweight and local. It mainly checks required fields and shows errors when the field was tried or when the parent component forces error mode through the `error` prop.

This keeps validation feedback simple without trying to replace the core model rules.

**Do not do this:** mutate incoming model nodes directly. The fields layer should derive UI state from the model, not rewrite the model in place.

---

## 11. Slots and Customization Architecture

Slots are a major part of the wrapper design.

Vue Flext is meant to work with default UI, but also to allow host apps to replace most visible pieces without forking the library.

### 11.1 Why so Many Slots Exist

Different apps need different document shells and different field widgets. Some want the default fields panel. Some want only the rendered HTML. Some want custom number inputs, custom boolean toggles, or custom error blocks.

Slots solve this without changing template semantics in the core engine.

### 11.2 Slot Forwarding Pattern

`Component.vue` forwards slots down into `Document.vue` and `Fields.vue` while keeping one public top-level API. Consumers work with one component, but the implementation stays split internally.

This is one of the main architectural choices in the repository.

**Do not do this:** add an internal slot in a child component and forget to expose or document it at the top level if it is meant for consumers.

---

## 12. State Sync and `v-model`

Vue Flext treats `v-model` as the main state contract between host apps and the wrapper.

### 12.1 Main Rule

The wrapper should emit fresh objects when form state changes.

This is why `Fields.vue` merges updates into `{ ...this.modelValue, ...data }` instead of mutating the original object directly. Vue consumers depend on that change signal.

### 12.2 Why the Computed Proxy Exists

`Component.vue` uses a computed `val` as a small control point between child components and the public `update:modelValue` event. This keeps the public `v-model` path consistent while the layout stays split into document and fields halves.

**Do not do this:** mutate `props.modelValue` directly or emit partial changes without merging when the public contract expects the full object.

---

## 13. Styling and Theme Boundaries

Vue Flext ships with default CSS, but styling is still part of the architecture.

`src/index.css` imports Tailwind, the Flext core CSS, and `vue-a4` CSS. This means the package surface is not just JavaScript. The CSS import is part of the integration contract too.

The `noTheme` prop exists because some consumers want the runtime behavior without the default page styling.

**Do not do this:** move essential rendering styles into random component-local blocks if consumers need them through the package-level CSS import.

---

## 14. Build and Distribution

Vue Flext is authored in TypeScript and Vue SFCs, then built into an ESM package with generated types and CSS.

The published surface is small:

* default export `Flext`
* named exports `Flext`, `FlextDocument`, and `FlextFields`
* CSS export `vue-flext/index.css`

This has one simple consequence for contributors: if you change source behavior, verify that the exported package surface still matches that source behavior.

`dist/` is output, not source.

---

## 15. Demo App as an Integration Layer

`test/app` is not just a playground. It is a practical architecture check.

It exercises the package the way a real consumer would: imported build output, live template editing, `v-model`, and preview rendering inside a Vue app.

This matters because many wrapper regressions do not appear as pure unit errors. They appear as broken slot payloads, missing CSS, bad reactivity, or preview issues in a host app.

When behavior changes at the wrapper level, inspect the demo app too.

---

## 16. Error Handling

The wrapper keeps errors visible on purpose.

`Document.vue` collects runtime failures through `onErrorCaptured` and local `try/catch` blocks, stores them in `errors`, and exposes them through `errors` and `error` slots.

This is important because template rendering errors must stay debuggable inside a Vue UI. Silent failure makes the wrapper impossible to trust.

**Do not do this:** swallow errors because the document still “mostly” renders. The error surface is part of the debugging contract.

---

## 17. Stability Boundaries

Some parts of Vue Flext are much more sensitive than others.

Stability-sensitive areas include public props, emit payloads, slot props, `v-model` behavior, `Document.vue` watchers, sandbox style isolation, and the fields mapping shape.

Other areas are safer to evolve, such as docs, example templates, default field styling, and small internal extractions that preserve behavior.

> 💡 **A useful rule is simple:** If the change affects how a Vue app integrates the library, treat it as high-impact.

---

## 18. Safe Change Zones vs. Sensitive

### Safer areas

Safer areas include docs, demo examples, visual polish in default field rendering, and internal cleanups that do not change props, emits, slots, or reactive timing.

### Sensitive areas

Sensitive areas include watcher behavior, `setTemplate`, slot contracts, `v-model` emits, shadow-root rendering, and any change that assumes something new about the Flext model shape.

Changes here require tighter review and stronger integration checks.

---

## 19. Common Extension Scenarios

This section answers the practical question: where should I change code?

### 19.1. Add a new top-level prop

**Main places:** `src/Component.vue`, child prop forwarding, typings, README, demo app.

### 19.2. Add a new document output mode

**Main places:** `src/components/Document.vue`, slot contract, README, demo app.

### 19.3. Add a new field widget type

**Main places:** `src/components/Fields.vue`, field mapping logic, fallback slot rendering, README, demo app.

### 19.4. Change how modules are passed from Vue

**Main places:** `src/components/Document.vue`, module watcher, README, integration checks.

### 19.5. Change package exports or CSS entry points

**Main places:** `src/index.ts`, `package.json`, build output verification, README.

### 19.6. Change template parsing semantics

> ⚠️ Usually **Not** in this repository. Prefer changes in `@trustme24/flext`, then adapt the wrapper only if needed.

---

## 20. Architectural Patterns

A few patterns show up repeatedly in the codebase.

### 20.1. Wrapper over reimplementation

The Vue layer should reuse the Flext core, not duplicate its logic.

### 20.2. Explicit props, explicit emits

Public behavior should be visible in component contracts, not hidden in magic side channels.

### 20.3. Split preview from fields

Document rendering and form generation are related, but they are not the same responsibility.

### 20.4. Slots over hardcoded UI

If host apps may reasonably want to replace a visible piece, a slot is usually better than locking the UI.

### 20.5. Fresh objects over mutation

Vue state sync should remain reactive and predictable.

### 20.6. Safety guards are features

Error capture, defensive watchers, and sandbox isolation are part of the architecture, not clutter.

---

## 21. What Vue Flext architecture intentionally avoids

**Vue Flext** avoids several things on purpose.

It avoids re-parsing templates outside the core. It avoids hidden global state. It avoids coupling template semantics to one specific UI kit. It avoids forcing one field design on consumers. It avoids silent API drift between docs, demo, and runtime behavior.

> 💡 **These limits** are part of why the wrapper stays understandable.

---

## 22. How to work safely in this codebase

Start with the smallest possible change. First identify whether the change is public API, document rendering, fields mapping, styling, or packaging. Then inspect the affected component and the demo app. After that, change behavior locally and keep the public contract in sync.

Good changes in Vue Flext are usually small, explicit, and easy to verify in a real Vue integration.

Bad changes usually look like this: one PR changes slot props, watcher timing, CSS imports, and field mapping at the same time without a clear boundary.

**Preferred approach:** checks first, then data preparation, then local helpers, then main flow. Keep components straightforward and avoid deep nesting.

**Do not do this:** use one large refactor to “clean up everything nearby.” In a wrapper library, unrelated cleanup often hides integration regressions.

---

## 24. Reading order for new contributors

If you want to understand **Flext** quickly, use this order:

1. Read [README.md](https://github.com/TrustMe-kz/vue-flext/blob/main/README.md)
2. Read [SimpleFlext](src/index.ts)
3. Read [Flext](src/index.ts)
4. Inspect parser helpers and collectors
5. Inspect built-in modules
6. Read tests for actual behavior

> 💡 **This order mirrors** the architecture: public contract first, internal mechanics second.

---

## 25. Final Rule of Thumb

When you are unsure where to make a change, ask one direct question:

**Is this change about parsing, metadata, modules, model generation, validation, or rendering?**

Pick one first. Start there. Do not begin with a wide refactor.

That simple rule is usually enough to keep Flext changes safe and understandable.

---

**Vue Flext by Kenny Romanov**  
TrustMe
