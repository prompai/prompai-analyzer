import {AnalyzeError} from "./error";


export function schemaValidate(schema: any, value: any, required: boolean, name: string) {

    if (!required && value === undefined) {
        return;
    }

    if (required && value === undefined) {
        throw new AnalyzeError(
            AnalyzeError.errors.missing_property
            , {
                name
            });
    }

    if (schema.type === 'string') {
        return stringValidate(schema, value, name);
    }

    if (schema.type === 'number') {
        return numberValidate(schema, value, name);
    }

    if (schema.type === 'integer') {
        return integerValidate(schema, value, name);
    }

    if (schema.type === 'boolean') {
        return booleanValidate(schema, value, name);
    }

    if (schema.type === 'object') {
        return objectValidate(schema, value, name);
    }

    if (schema.type === 'array') {
        return arrayValidate(schema, value, name);
    }


    return false;
}


function stringValidate(schema: any, value: any, name: string) {
    if (typeof value !== 'string') {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'string'
            }
        );
    }

    if (schema.enum) {
        if (schema.enum.indexOf(value) === -1) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_enum,
                {
                    name,
                    enum: schema.enum
                }
            );
        }
    }

    if (schema.minLength) {
        if (value.length < schema.minLength) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_minLength,
                {
                    name,
                    min: schema.minLength
                }
            );
        }
    }

    if (schema.maxLength) {
        if (value.length > schema.maxLength) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_maxLength,
                {
                    name,
                    max: schema.maxLength
                }
            );
        }
    }

    if (schema.pattern) {
        if (!new RegExp(schema.pattern).test(value)) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_pattern,
                {
                    name,
                    pattern: schema.pattern,
                    invalidText: schema.invalidText
                }
            );
        }
    }

    return true;
}

function numberValidate(schema: any, value: any, name: string) {
    if (typeof value !== 'number') {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'number'
            }
        );
    }

    if (schema.enum) {
        if (schema.enum.indexOf(value) === -1) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_enum,
                {
                    name,
                    enum: schema.enum
                }
            );
        }
    }

    if (schema.minimum) {
        if (value < schema.minimum) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_min,
                {
                    name,
                    min: schema.minimum
                }
            );
        }
    }

    if (schema.maximum) {
        if (value > schema.maximum) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_max,
                {
                    name,
                    max: schema.maximum
                }
            );
        }
    }

    if (schema.multipleOf) {
        if (value % schema.multipleOf !== 0) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_multipleOf,
                {
                    name,
                    multipleOf: schema.multipleOf
                }
            );
        }
    }

    return true;
}


function integerValidate(schema: any, value: any, name: string) {
    if (typeof value !== 'number') {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'integer'
            }
        );
    }

    if (schema.enum) {
        if (schema.enum.indexOf(value) === -1) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_enum,
                {
                    name,
                    enum: schema.enum
                }
            );
        }
    }

    if (schema.minimum) {
        if (value < schema.minimum) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_min,
                {
                    name,
                    min: schema.minimum
                }
            );
        }
    }

    if (schema.maximum) {
        if (value > schema.maximum) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_max,
                {
                    name,
                    max: schema.maximum
                }
            );
        }
    }

    if (schema.multipleOf) {
        if (value % schema.multipleOf !== 0) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_multipleOf,
                {
                    name,
                    multipleOf: schema.multipleOf
                }
            );
        }
    }

    return true;
}


function booleanValidate(schema: any, value: any, name: string) {
    if (typeof value !== 'boolean') {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'boolean'
            }
        );
    }

    if (schema.enum) {
        if (schema.enum.indexOf(value) === -1) {
            throw new AnalyzeError(
                AnalyzeError.errors.invalid_enum,
                {
                    name,
                    enum: schema.enum
                }
            );
        }
    }

    return true;
}


function objectValidate(schema: any, value: any, name: string) {
    if (typeof value !== 'object') {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'object'
            }
        );
    }

    if (schema.properties) {
        for (const key in schema.properties) {
            if (schema.required && schema.required.indexOf(key) !== -1) {
                if (value[key] === undefined) {
                    throw new AnalyzeError(
                        AnalyzeError.errors.missing_property,
                        {
                            name: key
                        }
                    );
                }
            }

            schemaValidate(schema.properties[key], value[key], schema.required && schema.required.indexOf(key) !== -1, key);
        }
    }

    return true;
}


function arrayValidate(schema: any, value: any, name: string) {
    if (!Array.isArray(value)) {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_type,
            {
                name,
                type: 'array'
            }
        );
    }

    if (schema.items) {
        for (let i = 0; i < value.length; i++) {
            schemaValidate(schema.items, value[i], true, name);
        }
    }

    return true;
}
