<script lang="ts">

import { defineComponent, ref, PropType } from 'vue';
import { NullablePropType } from '@/types';


// Types

export type PropsOption = {
  key?: string|number|null,
  name?: string|number|null,
  value?: any,
  isSelected?: boolean|null,
  isDisabled?: boolean|null,
};

export type Option = {
  key: string|number,
  name: string,
  value: any,
  isDisabled: boolean,
};


export default defineComponent({
  name: 'FlextFieldsRadioRange',

  props: {
    label: String as NullablePropType<string>,

    options: {
      type: Array as PropType<PropsOption[]>,
      default: (): PropsOption[] => [],
    },
    modelValue: {},

    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
  },

  setup() {
    const preparedOptions = ref<Option[]>([]);

    return { preparedOptions };
  },

  methods: {
    match(val: any): Option | null {
      for (const option of this.preparedOptions) {
        const isMatch = option?.value === val;
        const isMatchObj = JSON.stringify(option?.value) === JSON.stringify(val);

        if (!isMatch && !isMatchObj) continue;

        return option;
      }

      return null;
    },
  },

  computed: {
    val: {
      get(): any {
        return this.match(this.modelValue);
      },
      set(val: Option): void {
        const value = val?.value ?? null;

        this.$emit('change', value);
        this.$emit('update:modelValue', value);
      },
    },
  },

  watch: {
    options: {
      handler(val: PropsOption[]): void {
        const result: Option[] = [];

        for (const [ i, option ] of val.entries()) {
          const key: string|number = option?.key ?? i;
          const value: string|number = option?.value ?? key;
          const name: string = String(option?.name ?? value);
          const isDisabled = !!option?.isDisabled;

          result.push({ key, value, name, isDisabled });
        }

        this.preparedOptions = result;
      },
      immediate: true,
      deep: true
    },
  },
});

</script>

<template>
  <div class="flext_fields_radio_range">
    <div
        v-if="label"
        class="flext_fields_radio_range_label"
        v-html="label"
    />

    <div class="flext_fields_radio_range_inner">
      <div
          v-for="(option, i) of preparedOptions"
          :key="i"
          class="flext_fields_radio_range_option"
      >
        <input
            type="checkbox"
            class="flext_fields_radio_option_checkbox"
            :value="val === option"
            :disabled="disabled"
            @check="val = option"
        >

        <div class="flext_fields_radio_option_label">
          {{ option?.name ?? 'Unknown Option' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.flext_fields_radio_range {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .flext_fields_radio_range_label {
    font-weight: 500;
  }

  .flext_fields_radio_range_inner {
    display: flex;
    gap: 1.25rem;
  }

  .flext_fields_radio_range_option {
    display: flex;
    gap: 0.5rem;
  }
}

</style>