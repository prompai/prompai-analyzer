import { Input } from "./input-base";
import { UiOutputItems } from "./ui-output";

export type UiInputTypeNames = 'i-text' | 'i-number' | 'for';

export interface UiInputItem<T = UiInputTypeNames> {
    type: T;
    name: string;
    label: string;
    [key: string]: any;
}



interface _WithPlaceholder {
    placeholder: string;
}

interface _CanGeneric {
    generic?: {
        unique?: boolean;
        minItems?: number;
        maxItems?: number;
    };
}

export interface _WithDefault<T> {
    default?: any;
}

export interface TextInput extends UiInputItem<"i-text">, _WithPlaceholder, _WithDefault<string>, _CanGeneric {
    pattern?: string;
    minlength?: number | string;
    maxlength?: number | string;
}

export interface NumberInput extends UiInputItem<"i-number">, _WithPlaceholder, _WithDefault<number>, _CanGeneric {
    min?: number | string;
    max?: number | string;
    step?: number | string;
    integer?: boolean | string;
}

export interface UiInput extends Input<'ui'> {
    type: 'ui';
    items: UiInputItems[];
}

export interface ForEachInput extends UiInputItem<'for'> {
    as: string;
    indexAs?: string;
    array: any[] | string;
    items: UiInputItems[];
}

export type UiInputItems =  TextInput | NumberInput | UiOutputItems | ForEachInput;

