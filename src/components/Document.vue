<script lang="ts">

import { defineComponent, onErrorCaptured, ref } from 'vue';
import { Flext } from '@trustme24/flext';
import { Nullable, NullablePropType, Obj } from '@/types';
import { has } from '@/lib';
import Paged from 'vue-a4';

export default defineComponent({
  name: 'FlextDocument',

  components: { Paged },

  props: {
    class: {
      type: String as NullablePropType<string>,
      default: null
    },
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

    sandbox: {
      type: Boolean as NullablePropType<boolean>,
      default: false
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
    const sandboxEl = ref<HTMLDivElement | null>(null);
    const sandboxStyle = ref<HTMLStyleElement | null>(null);
    const sandboxRoot = ref<HTMLDivElement | null>(null);
    const errors = ref<Error[]>([]);
    const templateVal = ref<string|null>(props?.template ?? null);
    const flext = ref<Flext | null>(new Flext(templateVal.value));
    const dataModel = ref<Obj | null>(null);
    const data = ref<Obj | null>(null);
    const css = ref<string|null>(null);
    const html = ref<string|null>(null);

    onErrorCaptured((err) => {
      errors.value.push(err);
      return false;
    });


    return {
      sandboxEl,
      sandboxStyle,
      sandboxRoot,
      errors,
      templateVal,
      flext,
      dataModel,
      data,
      css,
      html,
    };
  },

  methods: {
    async setTemplate(val: string, data: Obj = {}): Promise<void> {
      try {
        this.flext?.setTemplate(val)?.setData(data ?? {});

        this.html = this.flext?.html ?? null;

        this.dataModel = this.flext?.model ?? null;

        this.css = await this.flext?.getCss() ?? null;
      } catch (e: any) {
        this.errors.push(e);
      }
    },
    sandboxPreviewCss(val: string): void {

      // Doing some checks

      if (!this.sandboxStyle) {
        console.warn('Flext: Unable to render the document: The sandbox is not ready yet');
        return;
      }


      // Rendering the styles

      this.sandboxStyle.textContent = val;
    },
    sandboxPreview(html: string, css?: string|null): void {

      // Doing some checks

      if (!this.sandboxRoot) {
        console.warn('Flext: Unable to render the document: The sandbox is not ready yet');
        return;
      }


      // Rendering the document

      this.sandboxPreviewCss(css ?? '');

      this.sandboxRoot.innerHTML = html;
    },
  },

  computed: {
    className(): string|null {
      let result = '';

      if (this.errors?.length)
        result += ' flex flex-col gap-8';

      if (this.class)
        result += ' ' + this.class;

      return result?.trim() || null;
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

    sandboxEl: {
      handler(val: HTMLDivElement | null): void {

        // Doing some checks

        if (!val) return;


        // Creating the sandbox

        const shadow = val.attachShadow({ mode: 'open' });
        const styleEl = document.createElement('style');
        const rootEl = document.createElement('div');

        shadow.appendChild(styleEl);

        shadow.appendChild(rootEl);


        // Updating the data

        this.sandboxStyle = styleEl;

        this.sandboxRoot = rootEl;
      },
      immediate: true,
      deep: true
    },

    templateVal: {
      async handler(val: Nullable<string>): Promise<void> {
        if (!val) return;

        this.errors = [];

        await this.setTemplate(val, this.data);
      },
      immediate: true
    },
    css: {
      handler(val: Nullable<string>): void {

        // Doing some checks

        if (!val) {
          this.sandboxPreview(this.html, '');
          return;
        }


        // Rendering the styles

        this.sandboxPreview(this.html, val);

        this.$emit('cssRender', val);
      },
      immediate: true,
      deep: true
    },
    dataModel: {
      handler(val: Nullable<Obj>): void {
        if (val) this.$emit('compiled', val);
        this.$emit('update:dataModel', val);
      },
      immediate: true,
      deep: true
    },
    data: {
      async handler(val: Nullable<Obj>): Promise<void> {

        // Doing some checks

        if (!val) return;


        // Setting the template

        this.errors = [];

        await this.setTemplate(this.templateVal, val);


        // Emitting the values

        if (val) this.$emit('change', val);

        this.$emit('update:modelValue', val);
      },
      immediate: true,
      deep: true
    },
    html: {
      handler(val: Nullable<string>): void {

        // Doing some checks

        if (!val) {
          this.sandboxPreview('');

          this.$emit('update:html', null);

          return;
        }


        // Rendering the document

        this.sandboxPreview(val, this.css);


        // Emitting the values

        this.$emit('render', val);

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
    :errors="errors"
  >
    <ul :class="className">
      <li v-for="(error, i) of errors" :key="i" class="flex flex-col gap-2">
        <slot name="error" :num="i" :error="error">
          <div class="font-semibold">
            ⚠️&nbsp;{{ error?.name ?? 'Error' }}
          </div>

          <div>
            {{ error?.message ?? 'Unknown Error' }}
          </div>
        </slot>
      </li>
    </ul>
  </slot>

  <slot v-else-if="html" name="content" :paged="paged" :html="html">
    <slot v-if="paged" name="paged" :html="html">
      <Paged :key="html" :class="className" :no-theme="noTheme">
        <span v-html="html" />
      </Paged>
    </slot>

    <slot v-else-if="sandbox" name="sandbox" :html="html">
      <div :class="className" ref="sandboxEl" />
    </slot>

    <slot v-else :html="html">
      <span :class="className" v-html="html" />
    </slot>
  </slot>

  <slot v-else name="noContent">
    <div :class="className">
      No Content
    </div>
  </slot>
</template>
