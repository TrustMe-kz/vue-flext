<script lang="ts">

import { defineComponent, PropType } from 'vue';
import { NullablePropType } from '@/types';

export default defineComponent({
  name: 'FlextFieldsCard',

  props: {
    label: String as NullablePropType<string>,

    descr: String as NullablePropType<string>,

    required: {
      type: Boolean as PropType<boolean>,
      default: false
    },
  },

  computed: {
    labelHtml(): string|null {
      if (!this.label) return null;

      let result = this.label;

      if (this.required) result += ' <span class="red">*</span>';

      return result;
    },
  }
});

</script>

<template>
  <div class="flext_fields_card">
    <div v-if="labelHtml" class="flext_fields_card_label" v-html="labelHtml" />

    <div class="workspace_card_inner">
      <slot>
        {{ descr }}
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">

.flext_fields_card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .flext_fields_card_label {
    font-weight: 500;
  }

  :deep(.red) {
    color: var(--flext-color-red);
  }
}

</style>