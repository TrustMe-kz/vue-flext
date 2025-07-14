import { Obj } from '@/types';

export function has(obj: Obj, key: string): boolean {
    return obj.hasOwnProperty(key);
}
