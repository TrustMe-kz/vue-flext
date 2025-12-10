<script lang="ts">

import { defineComponent, ref, PropType } from 'vue';
import { Obj, NullablePropType } from '@/types';
import { ensureObject, ensureArray } from '@/lib';
import Flext from '@trustme24/flext';
import FieldsCard from './FieldsCard.vue';
import FieldsRadioRange from './FieldsRadioRange.vue';


// Types

export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'mixed' | string;

export type Field = {
  type: FieldType,
  name: string,
  label?: string|null,
  hint?: string|null,
  value?: string|null,
  isRequired: boolean,
  onUpdate?: FieldUpdateHandler | null,
  extra?: {
    isTried?: boolean|null,
  },
};

export type Group = {
  name: string,
  label?: string|null,
  fields: Field[],
  isRequired: boolean,
  onUpdate?: GroupUpdateHandler | null,
};

export type Card = {
  name: string,
  label?: string|null,
  groups: Group[],
  isRequired: boolean,
  onUpdate?: CardUpdateHandler | null,
};

export type FieldUpdateHandler = (_val: any) => void;

export type GroupUpdateHandler = (_val: Obj) => void;

export type CardUpdateHandler = GroupUpdateHandler;

export type CardsUpdateHandler = GroupUpdateHandler;


// Constants

export const DEFAULT_FIELD_TYPE: FieldType = 'string';


export default defineComponent({
  name: 'FlextFields',

  components: { FieldsCard, FieldsRadioRange },

  props: {
    template: {
      type: String as PropType<string>,
      required: true
    },
    radioYesLabel: {
      type: String as NullablePropType<string>,
      default: 'Yes'
    },
    radioNoLabel: {
      type: String as NullablePropType<string>,
      default: 'No'
    },

    modelValue: {
      type: Object as NullablePropType<Obj>,
      default: null
    },

    error: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },

  setup() {
    const cards = ref<Card[] | null>(null);

    return {
      ensureObject,
      ensureArray,
      cards,
    };
  },

  methods: {
    objToField(val: Obj, _onUpdate: FieldUpdateHandler | null = null): Field {
      const type = val?.type ?? DEFAULT_FIELD_TYPE as FieldType;
      const name = val?.name ?? null;
      const labelStr = val?.label ?? null;
      const hintStr = val?.hint ?? null;
      const label = hintStr ? labelStr : null;
      const hint = hintStr ?? labelStr ?? name ?? null;
      const isRequired = !!val?.isRequired;
      const extra = { isTried: false };


      // Getting the value

      let value = val?.value ?? null;

      if (type === 'boolean' && !value && isRequired) value = true;


      // Defining the functions

      const onUpdate = (val: any) => {
        field.value = val;

        switch (type) {
          case 'object':
            _onUpdate(ensureObject(val));
            break;

          case 'array':
            _onUpdate(ensureArray(val));
            break;

          default:
            _onUpdate(val);
            break;
        }
      };


      // Getting the field

      const field = { type, name, label, hint, value, isRequired, onUpdate, extra };


      return field;
    },
    objToGroup(val: Obj, onUpdate: GroupUpdateHandler | null = null): Group {
      const name = val?.name ?? null;
      const label = val?.label ?? name ?? null;
      const nodes = val?.$ ?? [];
      const fields: Field[] = [];
      const data: Obj = {};


      // If the node itself is a field

      if (!nodes?.length) {

        // Defining the functions

        const onFieldUpdate = (val: any) => {
          onUpdate(val);
        };


        // Getting the field

        const field = this.objToField(val, onFieldUpdate);
        const isRequired = !!field?.isRequired;


        // Pushing the field

        fields.push(field);


        return { name, label, fields, isRequired, onUpdate };
      }


      // Iterating for each node

      let isRequired = true;

      for (const node of nodes) {
        const fieldName = node?.name ?? null;


        // Defining the functions

        const onFieldUpdate = (val: any) => {
          data[fieldName] = val;
          onUpdate(data);
        };


        // Getting the field

        const field = this.objToField(node, onFieldUpdate);


        // Doing some checks

        if (!field?.isRequired) isRequired = false;


        // Pushing the field

        fields.push(field);
      }


      return { name, label, fields, isRequired, onUpdate };
    },
    objToCard(val: Obj, onUpdate: CardUpdateHandler | null = null): Card {
      const name = val?.name ?? null;
      const label = val?.label ?? name ?? null;
      const nodes = val?.$ ?? [];
      const groups: Group[] = [];
      const data: Obj = {};


      // If the node itself is a field

      if (!nodes?.length) {

        // Defining the functions

        const onGroupUpdate = (val: any) => {
          onUpdate(val);
        };

        const onFieldUpdate = (val: any) => {
          onGroupUpdate(val);
        };


        // Getting the field and the group

        const field = this.objToField(val, onFieldUpdate);
        const isRequired = !!field?.isRequired;
        const group: Group = {
          name: field?.name ?? 'unknown',
          fields: [field],
          isRequired: isRequired,
          onUpdate: onGroupUpdate,
        };


        // Pushing the group

        groups.push(group);


        return { name, label, groups, isRequired, onUpdate };
      }


      // Iterating for each node

      let isRequired = true;

      for (const node of nodes) {
        const groupName = node?.name ?? null;


        // Defining the functions

        const onGroupUpdate = (val: any) => {
          data[groupName] = val;
          onUpdate(data);
        };


        // Getting the group

        const group = this.objToGroup(node, onGroupUpdate);


        // Doing some checks

        if (!group?.isRequired) isRequired = false;


        // Pushing the group

        groups.push(group);
      }


      return { name, label, groups, isRequired, onUpdate };
    },
    arrToCards(val: Obj[], onUpdate: CardsUpdateHandler | null = null): Card[] {
      const data: Obj = {};
      const result: Card[] = [];


      // Iterating for each card node

      for (const node of val) {
        const cardName = node?.name ?? null;

        const onCardUpdate = (val: any) => {
          data[cardName] = val;
          onUpdate(data);
        };

        result.push(this.objToCard(node, onCardUpdate));
      }


      return result;
    },

    isFieldValid(field: Field): boolean {
      return !field?.value && !!field?.isRequired;
    },
    isFieldError(field: Field): boolean {
      const isTried = !!field?.extra?.isTried || this.error;
      return this.isFieldValid(field) && isTried;
    },

    onUpdate(data: any): void {
      this.$emit('change', { ...this.modelValue, ...data });
      this.$emit('update:modelValue', { ...this.modelValue, ...data });
    },
  },

  computed: {
    model() {
      return new Flext().setTemplate(this.template).model;
    },
  },

  watch: {
    model: {
      handler(val: Obj[] | null): void {
        console.log('_val_', val);
        if (val)
          this.cards = this.arrToCards(val, this.onUpdate.bind(this));
        else
          this.cards = null;
      },
      immediate: true,
      deep: true
    },
    cards: {
      handler(val: Card[] | null): void {
        if (!val) return;

        for (const card of val) for (const group of card.groups) for (const field of group.fields)
          if (field.value)
            field.onUpdate(field.value);
      },
      immediate: true,
      deep: true
    },
  },
});

</script>

<template>
  <div v-if="cards" class="flext_fields">
    <slot name="before" />

    <!-- Cards ("Hospital") -->

    <FieldsCard
        v-for="(card, i) of cards"
        :key="'card_'+i"
        class="flext_fields_card"
        :label="card?.label ?? card?.name ?? 'Fields'"
        :required="!!card?.isRequired"
        no-collapse
    >
      <div class="flext_fields_card_inner">

        <!-- Groups ("Department", "Patient") -->

        <div
            v-for="(group, j) of card.groups"
            :key="`card_${i}group_${j}`"
            class="flext_fields_group"
        >

          <!-- Group Label ("Department*") -->

          <div v-if="group?.fields?.length > 1" class="flext_fields_group_label">
            {{ group?.label ?? group?.name ?? 'Fields' }} <span v-if="!!group?.isRequired" class="red">*</span>
          </div>

          <!-- Fields ("Vaccine Name", "Patient Full Name") -->

          <div
              v-for="(field, k) of group.fields"
              :key="`card_${i}group_${j}_field_${k}`"
              class="flext_field"
          >

            <!-- Field Label -->

            <div v-if="field?.label" class="flext_field_label">
              {{ field?.label ?? 'Unknown Field' }}
            </div>

            <!-- Numeric Field ("Vaccine Amount") -->

            <slot
                v-if="field?.type === 'number'"
                name="numericField"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <input
                  type="number"
                  class="flext_fields_field"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              />
            </slot>

            <!-- Boolean Field ("Are You Agree?") -->

            <slot
                v-else-if="field?.type === 'boolean'"
                name="booleanField"
                :field="field"
                :value="field.value"
                :disabled="disabled"
                :required="!!field?.isRequired"
            >
              <FieldsRadioRange
                  :label="field?.hint ?? null"
                  :model-value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  :options="[
                    {
                      name: radioYesLabel,
                      value: true,
                    },
                    {
                      name: radioNoLabel,
                      value: false,
                    },
                  ]"
                  @update:modelValue="val => field?.onUpdate(val)"
              />
            </slot>

            <!-- Object Field ({ "a": "1", "b": "2" }) -->

            <slot
                v-else-if="field?.type === 'object'"
                name="objectField"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <textarea
                  class="flext_fields_field"
                  rows="4"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              ></textarea>
            </slot>

            <!-- Array Field ([ "a", "b" ]) -->

            <slot
                v-else-if="field?.type === 'array'"
                name="arrayField"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <textarea
                  class="flext_fields_field"
                  rows="4"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              ></textarea>
            </slot>

            <!-- Date Field ("2025-12-01T06:00:00+00:00") -->

            <slot
                v-else-if="field?.type === 'date'"
                name="dateField"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <input
                  type="date"
                  class="flext_fields_field"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              />
            </slot>

            <!-- Mixed Field (10300, "10.300") -->

            <slot
                v-else-if="field?.type === 'mixed'"
                name="mixedField"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <textarea
                  class="flext_fields_field"
                  rows="4"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              ></textarea>
            </slot>

            <!-- Text Field ("Vaccine Name") -->

            <slot
                v-else
                name="field"
                :field="field"
                :hint="field?.hint ?? null"
                :value="field.value"
                :disabled="disabled"
                :error="isFieldError(field)"
                :required="!!field?.isRequired"
            >
              <input
                  class="flext_fields_field"
                  :placeholder="field?.hint ?? null"
                  :value="field.value"
                  :disabled="disabled"
                  :required="!!field?.isRequired"
                  @input="(e: any) => field?.onUpdate(e?.target?.value ?? null)"
                  @blur="field.extra.isTried = true"
              />
            </slot>
          </div>
        </div>
      </div>
    </FieldsCard>

    <slot name="after" />
  </div>

  <slot v-else name="noContent">
    <div class="flext_fields">
      No Content
    </div>
  </slot>
</template>

<style scoped lang="scss">

.flext_fields {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  :deep(.red) {
    color: var(--flext-color-red);
  }

  .flext_fields_card {
    .flext_fields_card_inner {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .flext_fields_group {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .flext_field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}

</style>