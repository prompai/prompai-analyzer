

export type InputTypeNames = 'ui' | 'json' | 'form-data' | 'binary';

export interface Input<T extends InputTypeNames> {
    type: T;
}