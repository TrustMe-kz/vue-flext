<script setup lang="ts">

import { computed } from 'vue';
import { MetadataModelNode } from '@trustme24/flext';
import { Obj } from '@/types';
import Document from './components/Document.vue';
import Fields from './components/Fields.vue';


// Defining the props

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


// Defining the emits

const emit = defineEmits<{
  (e: 'render', _val: string): void,
  (e: 'cssRender', _val: string): void,
  (e: 'dataModel', _val: MetadataModelNode[] | null): void,
  (e: 'change', _val: Obj | null): void,
  (e: 'update:modelValue', _val: Obj | null): void,
}>();


// Defining the functions

const onRender = (_val: string): void => emit('render', _val);

const onCssRender = (_val: string): void => emit('cssRender', _val);

const onDataModel = (_val: MetadataModelNode[] | null): void => emit('dataModel', _val);

const onChange = (_val: Obj | null): void => emit('change', _val);


// Defining the computed

const val = computed({
  get(): Obj | null {
    return props.modelValue;
  },
  set(_val: Obj | null): void {
    emit('update:modelValue', _val);
  },
});

</script>

<template>
  <div class="flext_layout">
    <slot
        name="document"
        :template="props.template"
        :modules="props.modules"
        :value="val"
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
          :value="props.modelValue"
          :sandbox="props.sandbox"
          :paged="props.paged"
          :no-theme="props.noTheme"
          @render="onRender"
          @cssRender="onCssRender"
          @dataModel="onDataModel"
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
        :value="val"
        :error="props.error"
        :disabled="props.disabled"
    >
      <Fields
          class="flext_layout_fields"
          :template="props.template"
          :radio-yes-label="props.radioYesLabel"
          :radio-no-label="props.radioNoLabel"
          :error="props.error"
          :disabled="props.disabled"
          @change="onChange"
          v-model="val"
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