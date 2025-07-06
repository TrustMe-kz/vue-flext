import { PropType } from 'vue';

export type Nullable<T> = T | null | undefined;

export type NullablePropType<T> = PropType<Nullable<T>>;
