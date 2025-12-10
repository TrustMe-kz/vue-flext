<script setup lang="ts">

import { ref } from 'vue';
import { Obj } from '@/types';
import { Textarea } from '@/shadcn/components/ui/textarea';
import Flext from '@flext/index.es';
import exampleTemplate from './exampleTemplate.hbs?raw';

const template = ref<string|null>(exampleTemplate);
const data = ref<Obj | null>(null);

</script>

<template>
  <div class="templates_page flex flex-col h-full p-4 gap-16 grow">
    <Textarea class="h-[35vh]" v-model="template" />

    <Flext
        class="templates_page_flext"
        :template="template"
        v-model="data"
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