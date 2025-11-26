<script setup lang="ts">

import { Obj } from '@/types';
import Document from './components/Document.vue';
import Fields from './components/Fields.vue';

const props = defineProps<{
  template?: string|null,
  modules?: Obj | null,
  radioYesLabel?: string|null,
  radioNoLabel?: string|null,

  modelValue?: Obj | null,

  sandbox?: boolean|null,
  paged?: boolean|null,
  error?: boolean|null,
  disabled?: boolean|null,
  noTheme?: boolean|null,
}>();


</script>

<template>
  <div class="flext_layout">
    <slot
        name="document"
        :template="props.template"
        :modules="props.modules"
        :model-value="props.modelValue"
        :sandbox="props.sandbox"
        :paged="props.paged"
        :error="props.error"
        :disabled="props.disabled"
        :no-theme="props.noTheme"
    >
      <Document
          class="flext_layout_document"
          :template="props.template"
          :modules="props.modules"
          :model-value="props.modelValue"
          :sandbox="props.sandbox"
          :paged="props.paged"
          :no-theme="props.noTheme"
      >
        <template #errors="{ errors }">
          <slot name="errors" :errors="errors" />
        </template>

        <template #error="{ error }">
          <slot name="error" :error="error" />
        </template>

        <template #content="{ paged, html }">
          <slot name="content" :paged="paged" :html="html" />
        </template>

        <template #paged="{ html }">
          <slot name="paged" :html="html" />
        </template>

        <template #sandbox="{ html }">
          <slot name="sandbox" :html="html" />
        </template>

        <template #noContent>
          <slot name="noContent" />
        </template>

        <template v-slot="{ html }">
          <slot :html="html" />
        </template>
      </Document>
    </slot>

    <slot
        name="fields"
        :template="props.template"
        :radio-yes-label="props.radioYesLabel"
        :radio-no-label="props.radioNoLabel"
        :model-value="props.modelValue"
        :error="props.error"
        :disabled="props.disabled"
    >
      <Fields
          class="flext_layout_fields"
          :template="props.template"
          :radio-yes-label="props.radioYesLabel"
          :radio-no-label="props.radioNoLabel"
          :model-value="props.modelValue"
          :error="props.error"
          :disabled="props.disabled"
      >
        <template #before>
          <slot name="beforeFields" />
        </template>

        <template #numericField="{ field, hint, value, disabled, error, required }">
          <slot
              name="numericField"
              :field="field"
              :hint="hint"
              :value="value"
              :disabled="disabled"
              :error="error"
              :required="required"
          />
        </template>

        <template #booleanField="{ field, value, disabled, required }">
          <slot
              name="booleanField"
              :field="field"
              :value="value"
              :disabled="disabled"
              :required="required"
          />
        </template>

        <template #field="{ field, hint, value, disabled, error, required }">
          <slot
              name="field"
              :field="field"
              :hint="hint"
              :value="value"
              :disabled="disabled"
              :error="error"
              :required="required"
          />
        </template>

        <template #after>
          <slot name="afterFields" />
        </template>

        <template #noContent>
          <slot name="noFields" />
        </template>
      </Fields>
    </slot>
  </div>
</template>

<style scoped lang="scss">

.flext_layout {
  display: flex;
  gap: 4rem;
}

</style>