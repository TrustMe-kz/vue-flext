<script lang="ts">

import { defineComponent, onErrorCaptured, ref } from 'vue';
import { Flext } from '@trustme24/flext';
import { Nullable, NullablePropType } from '@/types';
import Display from 'vue-a4';

export default defineComponent({
  name: 'Flext',

  components: { Display },

  props: {
    template: {
      type: String as NullablePropType<string>,
      default: null
    },

    paged: {
      type: Boolean as NullablePropType<boolean>,
      default: false
    },
    noTheme: {
      type: Boolean as NullablePropType<boolean>,
      default: false
    },
  },

  setup(props) {
    const errors = ref<Error[]>([]);
    const val = ref<string|null>(props?.template ?? null);
    const flext = ref<Flext | null>(new Flext(val.value));
    const html = ref<string|null>(null);

    onErrorCaptured((err) => {
      errors.value.push(err);
      return false;
    });


    return { errors, val, flext, html };
  },

  watch: {
    template: {
      handler(val: string|null|undefined): void {
        this.val = val;
      },
      immediate: true
    },

    val: {
      handler(val: Nullable<string>): void {
        this.errors = [];

        try { this.html = this.flext?.setHbs(val)?.html ?? null; }
        catch (e: any) { this.errors.push(e); }
      },
      immediate: true
    },

    html: {
      handler(val: Nullable<string>): void {
        if (val) this.$emit('render', val);
        this.$emit('update:html', val);
      },
      immediate: true
    },
  },
});

</script>

<template>
  <slot
    v-if="errors?.length"
    name="errors"
    :data="errors"
  >
    <ul class="flex flex-col gap-8">
      <li v-for="(error, i) of errors" class="flex flex-col gap-2" :key="i">
        <div class="font-semibold">
          ⚠️&nbsp;{{ error?.name ?? 'Error' }}
        </div>

        <div>
          {{ error?.message ?? 'Unknown Error' }}
        </div>
      </li>
    </ul>
  </slot>

  <slot v-else-if="html" :html="html" :paged="paged">
    <Display v-if="paged" :no-theme="noTheme">
      <span v-html="html" />
    </Display>

    <span v-else v-html="html" />
  </slot>

  <slot v-else name="no-content">
    No Content
  </slot>
</template>
