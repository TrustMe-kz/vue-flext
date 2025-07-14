<script lang="ts">

import { defineComponent, onErrorCaptured, ref } from 'vue';
import { Flext } from '@trustme24/flext';
import { Nullable, NullablePropType, Obj } from '@/types';
import { has } from '@/lib';
import Paged from 'vue-a4';

export default defineComponent({
  name: 'Flext',

  components: { Paged },

  props: {
    template: {
      type: String as NullablePropType<string>,
      default: null
    },
    modules: {
      type: Object as NullablePropType<Obj>,
      default: null
    },

    modelValue: {
      type: Object as NullablePropType<Obj>,
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
    const templateVal = ref<string|null>(props?.template ?? null);
    const flext = ref<Flext | null>(new Flext(templateVal.value));
    const dataModel = ref<Obj | null>(null);
    const data = ref<Obj | null>(null);
    const html = ref<string|null>(null);

    onErrorCaptured((err) => {
      errors.value.push(err);
      return false;
    });


    return {
      errors,
      templateVal,
      flext,
      dataModel,
      data,
      html,
    };
  },

  methods: {
    setTemplate(val: string, data: Obj = {}): void {
      try {
        this.flext?.setTemplate(val)?.setData(data);
        this.html = this.flext?.html ?? null;
        this.dataModel = this.flext?.model ?? null;
      } catch (e: any) {
        this.errors.push(e);
      }
    },
  },

  watch: {
    template: {
      handler(val: string|null|undefined): void {
        this.templateVal = val;
      },
      immediate: true
    },
    modules: {
      handler(val: Nullable<Obj>): void {

        // Doing some checks

        if (!val) return;


        // Iterating for each module

        for (const name in val) {
          if (!has(val, name)) continue;

          const module = val[name];

          this.flext.addModule(name, module);
        }
      },
      immediate: true,
      deep: true
    },
    modelValue: {
      handler(val: Nullable<Obj>): void {
        if (!val) return;
        this.data = val;
      },
      immediate: true,
      deep: true
    },

    templateVal: {
      handler(val: Nullable<string>): void {
        if (!val) return;

        this.errors = [];

        this.setTemplate(val, this.data);
      },
      immediate: true
    },
    data: {
      handler(val: Nullable<Obj>): void {

        // Doing some checks

        if (!val) return;


        // Setting the template

        this.errors = [];

        this.setTemplate(this.templateVal, val);


        // Emitting the values

        if (val) this.$emit('change', val);

        this.$emit('update:modelValue', val);
      },
      immediate: true,
      deep: true
    },
    html: {
      handler(val: Nullable<string>): void {
        if (val) this.$emit('render', val);
        this.$emit('update:html', val);
      },
      immediate: true
    },
    dataModel: {
      handler(val: Nullable<Obj>): void {
        if (val) this.$emit('compiled', val);
        this.$emit('update:dataModel', val);
      },
      immediate: true,
      deep: true
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
    <Paged v-if="paged" :key="html" :no-theme="noTheme">
      <span v-html="html" />
    </Paged>

    <span v-else v-html="html" />
  </slot>

  <slot v-else name="no-content">
    No Content
  </slot>
</template>
