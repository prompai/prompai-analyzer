export class AnalyzeError extends Error {

    constructor(public code: string, public data: {}, public location: string[] = []) {

        let message;

        if (code in AnalyzeError.messages) {
            message = AnalyzeError.messages[code]!(data);
        } else {
            throw new Error(`unknown error code ${code}`);
        }


        super(message);
        this.name = 'AnalyzeError';
    }


    toJSON() {
        return {
            name: this.name,
            code: this.code,
            data: this.data,
            location: this.location,
        };
    }

    static errors = {
        missing_property: 'missing_property',
        invalid_type: 'invalid_type',
        invalid_enum: 'invalid_enum',
        invalid_format: 'invalid_format',
        invalid_pattern: 'invalid_pattern',
        invalid_pattern_prop: 'invalid_pattern_prop',
        invalid_length: 'invalid_length',
        invalid_min: 'invalid_min',
        invalid_max: 'invalid_max',
        invalid_minLength: 'invalid_minLength',
        invalid_maxLength: 'invalid_maxLength',
        propertyCannotParameter: 'property_cannot_parameter',
        unknown_type: 'unknown_type',
        input_not_allowed: 'input_not_allowed',
        invalid_min_items: 'invalid_min_items',
        invalid_max_items: 'invalid_max_items',
        invalid_multipleOf: 'invalid_multipleOf',
        invalid_property: 'invalid_property',
        name_reserved: 'name_reserved',
        can_be_null: 'can_be_null',
        required_and_disabled: 'required_and_disabled',
        invalid_min_max_items: 'invalid_min_max_items',
    }


    static messages: {
        [key: string]: (params: any) => string
    } = {
        missing_property: (params: { name: string }) => `missing property ${params.name!}`,
        invalid_type: (params: {
            name: string,
            type: string
        }) => `invalid type for property ${params.name!}, expected ${params.type!}`,
        invalid_enum: (params: {
            name: string,
            enum: string[]
        }) => `invalid enum value for property ${params.name!}, expected ${params.enum!.join(', ')}`,
        invalid_format: (params: {
            name: string,
            format: string
        }) => `invalid format for property ${params.name!}, expected ${params.format!}`,
        invalid_pattern: (params: {
            name: string,
            pattern: string,
            invalidText?: string
        }) => params.invalidText ?? `invalid pattern for property ${params.name!}, expected ${params.pattern!}`,
        invalid_pattern_prop: (params: {
            name: string,
            pattern: string
        }) => `invalid pattern for property ${params.name!}, expected valid regex pattern.`,
        invalid_length: (params: { name: string, min?: number, max?: number }) => {
            if (params.min && params.max) {
                return `invalid length for property ${params.name!}, expected length between ${params.min} and ${params.max}`;
            } else if (params.min) {
                return `invalid length for property ${params.name!}, expected length more than ${params.min}`;
            } else if (params.max) {
                return `invalid length for property ${params.name!}, expected length less than ${params.max}`;
            } else {
                return `invalid length for property ${params.name!}`;
            }
        },
        invalid_min: (params: { name: string, min: number }) => `invalid value for property ${params.name!}, expected value more than ${params.min}`,
        invalid_max: (params: { name: string, max: number }) => `invalid value for property ${params.name!}, expected value less than ${params.max}`,
        invalid_minLength: (params: { name: string, min: number }) => `invalid length for property ${params.name!}, expected length more than ${params.min}`,
        invalid_maxLength: (params: { name: string, max: number }) => `invalid length for property ${params.name!}, expected length less than ${params.max}`,
        propertyCannotParameter: (params: { name: string }) => `property ${params.name!} cannot be a parameter`,
        unknown_type: (params: { name: string, type: string }) => `unknown type "${params.type!}"`,
        input_not_allowed: (params: {  }) => `input not allowed`,
        invalid_min_items: (params: { name: string, min: number }) => `invalid min items for property ${params.name!}, expected min items more than ${params.min}`,
        invalid_max_items: (params: { name: string, max: number }) => `invalid max items for property ${params.name!}, expected max items less than ${params.max}`,
        invalid_multipleOf: (params: { name: string, multipleOf: number }) => `invalid multipleOf for property ${params.name!}, expected multipleOf is ${params.multipleOf}`,
        invalid_property: (params: { name: string, description: string }) => `invalid property ${params.name!}. ${params.description}`,
        name_reserved: (params: { name: string, value: string }) => `invalid name for property ${params.name!}, "${params.value!}" is reserved`,
        can_be_null: (params: { name: string }) => `invalid parameter. ${params.name} can be null. Specify a default value with "||"`,
        required_and_disabled: (params: { name: string }) => `invalid parameter. ${params.name} is required and disabled`,
        invalid_min_max_items: (params: { name: string, min: number, max: number }) => `invalid min/max items for property ${params.name!}, expected min items more than ${params.min} and max items less than ${params.max}`,
    }

}