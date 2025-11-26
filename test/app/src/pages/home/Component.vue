<script setup lang="ts">

import { ref, computed } from 'vue';
import { Obj } from '@/types';
import { Textarea } from '@/shadcn/components/ui/textarea';
import Flext from '@flext/index.es';
import exampleTemplateSyntax from './example-template/syntax.hbs?raw';
import exampleTemplateData from './example-template/data.json';


// Defining the variables

const template = ref<string|null>(exampleTemplateSyntax);
const dataStr = ref<string|null>(JSON.stringify(exampleTemplateData, null, 2));


// Defining the computed

const data = computed<Obj | null>(() => {
  try { return JSON.parse(dataStr.value); }
  catch (e: any) { return null; }
});

</script>

<template>
  <div class="templates_page flex flex-col h-full p-4 gap-16 grow">
    <div class="h-[35vh] flex gap-2">
      <Textarea v-model="template" />
      <Textarea v-model="dataStr" />
    </div>

    <Flext
        class="templates_page_flext"
        :template="template"
        :model-value="data"
        sandbox
    />
  </div>
</template>

<style>

.templates_page {
  .templates_page_flext.flext_layout {
    --flext-template-page-gap: 0.5em;
    --flext-template-page-half-gap: calc(0.5 * var(--flext-template-page-gap));

    gap: var(--flext-template-page-gap);

    .flext_layout_document,
    .flext_layout_fields {
      flex-shrink: 0;
      width: calc(50% - var(--flext-template-page-half-gap));
    }

    .flext_layout_document {
      padding-right: 4em;
    }
  }
}

</style>