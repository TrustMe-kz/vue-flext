import { Obj } from '@/types';
import { NotAnArrayWarning } from '@/errors';


// Checking Functions

export function isObject(val: any): boolean {
    return typeof val === 'object' && val !== null;
}

export function has(obj: Obj, key: string): boolean {
    return obj.hasOwnProperty(key);
}


// System Functions

export function audit(val: any): string {
    if (isObject(val))
        return JSON.stringify(val);

    else if (typeof val === 'string')
        return `'${val}'`;

    else
        return String(val);
}


// Framework Functions

export function ensureObject<T extends Obj = Obj, W extends boolean = false>(val: any, doWarn?: W | null): W extends true ? T : T | null {
    if (isObject(val))
        return val;

    else if (typeof val === 'string') {
        try { return JSON.parse(val); }
        catch (e: any) { if (doWarn) throw e; }
    }

    else
        return null;
}

export function ensureArray<T = any, W extends boolean = false>(val: any, doWarn?: W | null): W extends true ? T[] : T[] | null {
    const arr = ensureObject(val, !!doWarn);

    if (Array.isArray(arr))
        return arr;

    else if (doWarn)
        throw new NotAnArrayWarning('The given value is not an array:' + audit(val));

    else
        return null;
}
