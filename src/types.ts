import { PropType } from 'vue';

export type Nullable<T> = T | null | undefined;

export type NullablePropType<T> = PropType<Nullable<T>>;

export type Obj<T = any> = Record<string, T>;
