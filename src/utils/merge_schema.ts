


// Her iki şemanın da ihtiyacını karşılaması gerek
export function mergeSchema(a: any, b: any): any {


    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return undefined;
        }

        return Array.from(new Set([...a, ...b]));
    }


    if (a.type !== b.type) {
        // handle any


        if (a.type === 'any') {
            return b;
        }

        if (b.type === 'any') {
            return a;
        }


        return undefined;
    }

    if (a.type === 'object') {

        const props = mergeSchema(a.properties, b.properties);

        if (props === undefined) {
            return undefined;
        }

        const required = mergeSchema(a.required, b.required);

        if (required === undefined) {
            return undefined;
        }

        return {
            type: 'object',
            properties: props,
            required: required
        }

    } else if (a.type === 'array') {

        const items = mergeSchema(a.items, b.items);

        if (items === undefined) {
            return undefined;
        }

        const res : any = {
            type: 'array',
            items: items
        }

        if (a.minItems) {
            if (b.minItems) {
                res.minItems = Math.min(a.minItems, b.minItems);
            } else {
                res.minItems = a.minItems;
            }
        } else if (b.minItems) {
            res.minItems = b.minItems;
        }

        if (a.maxItems) {
            if (b.maxItems) {
                res.maxItems = Math.max(a.maxItems, b.maxItems);
            } else {
                res.maxItems = a.maxItems;
            }
        } else if (b.maxItems) {
            res.maxItems = b.maxItems;
        }

        if (res.minItems && res.maxItems && res.minItems > res.maxItems) {
            return undefined;
        }

        res.uniqueItems = a.uniqueItems || b.uniqueItems;


        return res;
    } else {

        if (a.type === 'string') {
            return mergeString(a, b);
        }

        if (a.type === 'number') {
            return mergeNumber(a, b);
        }

        if (a.type === 'integer') {
            return mergeInteger(a, b);
        }

        if (a.type === 'boolean') {
            return mergeBoolean(a, b);
        }

        if (a.type === 'null') {
            return mergeNull(a, b);
        }

        return undefined;

    }


}


function mergeString(a: any, b: any): any {

    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    const res : any = {}

    res.type = 'string';

    if (a.minLength) {

        if (b.minLength) {
            res.minLength = Math.min(a.minLength, b.minLength);
        } else {
            res.minLength = a.minLength;
        }

    } else if (b.minLength) {
        res.minLength = b.minLength;
    }


    if (a.maxLength) {

        if (b.maxLength) {
            res.maxLength = Math.max(a.maxLength, b.maxLength);
        } else {
            res.maxLength = a.maxLength;
        }

    } else if (b.maxLength) {
        res.maxLength = b.maxLength;
    }

    if (res.minLength && res.maxLength && res.minLength > res.maxLength) {
        return undefined;
    }


    if (a.pattern && b.pattern && a.pattern === b.pattern) {
        res.pattern = a.pattern;
    } else if (a.pattern) {
        res.pattern = a.pattern;
    } else if (b.pattern) {
        res.pattern = b.pattern;
    } else if (a.pattern && b.pattern && a.pattern !== b.pattern) {
        return undefined;
    }

    if (a.format && b.format && a.format === b.format) {
        res.format = a.format;
    } else if (a.format) {
        res.format = a.format;
    } else if (b.format) {
        res.format = b.format;
    } else if (a.format && b.format && a.format !== b.format) {
        return undefined;
    }



    return res;
}



function mergeNumber(a: any, b: any): any {

    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    const res : any = {}

    res.type = 'number';

    if (a.minimum) {

        if (b.minimum) {
            res.minimum = Math.min(a.minimum, b.minimum);
        } else {
            res.minimum = a.minimum;
        }

    } else if (b.minimum) {
        res.minimum = b.minimum;
    }


    if (a.maximum) {

        if (b.maximum) {
            res.maximum = Math.max(a.maximum, b.maximum);
        } else {
            res.maximum = a.maximum;
        }

    } else if (b.maximum) {
        res.maximum = b.maximum;
    }

    if (res.minimum && res.maximum && res.minimum > res.maximum) {
        return undefined;
    }


    if (a.exclusiveMinimum && b.exclusiveMinimum) {
        res.exclusiveMinimum = Math.max(a.exclusiveMinimum, b.exclusiveMinimum);
    } else if (a.exclusiveMinimum) {
        res.exclusiveMinimum = a.exclusiveMinimum;
    } else if (b.exclusiveMinimum) {
        res.exclusiveMinimum = b.exclusiveMinimum;
    }

    if (a.exclusiveMaximum && b.exclusiveMaximum) {
        res.exclusiveMaximum = Math.min(a.exclusiveMaximum, b.exclusiveMaximum);
    } else if (a.exclusiveMaximum) {
        res.exclusiveMaximum = a.exclusiveMaximum;
    } else if (b.exclusiveMaximum) {
        res.exclusiveMaximum = b.exclusiveMaximum;
    }

    if (res.exclusiveMinimum && res.exclusiveMaximum && res.exclusiveMinimum > res.exclusiveMaximum) {
        return undefined;
    }

    if (a.multipleOf && b.multipleOf && a.multipleOf === b.multipleOf) {
        res.multipleOf = a.multipleOf;
    } else if (a.multipleOf) {
        res.multipleOf = a.multipleOf;
    } else if (b.multipleOf) {
        res.multipleOf = b.multipleOf;
    } else if (a.multipleOf && b.multipleOf && a.multipleOf !== b.multipleOf) {
        return undefined;
    }

    return res;

}


function mergeInteger(a: any, b: any): any {

    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    const res : any = {}

    res.type = 'integer';

    if (a.minimum) {

        if (b.minimum) {
            res.minimum = Math.min(a.minimum, b.minimum);
        } else {
            res.minimum = a.minimum;
        }

    } else if (b.minimum) {
        res.minimum = b.minimum;
    }


    if (a.maximum) {

        if (b.maximum) {
            res.maximum = Math.max(a.maximum, b.maximum);
        } else {
            res.maximum = a.maximum;
        }

    } else if (b.maximum) {
        res.maximum = b.maximum;
    }

    if (res.minimum && res.maximum && res.minimum > res.maximum) {
        return undefined;
    }


    if (a.exclusiveMinimum && b.exclusiveMinimum) {
        res.exclusiveMinimum = Math.max(a.exclusiveMinimum, b.exclusiveMinimum);
    } else if (a.exclusiveMinimum) {
        res.exclusiveMinimum = a.exclusiveMinimum;
    } else if (b.exclusiveMinimum) {
        res.exclusiveMinimum = b.exclusiveMinimum;
    }

    if (a.exclusiveMaximum && b.exclusiveMaximum) {
        res.exclusiveMaximum = Math.min(a.exclusiveMaximum, b.exclusiveMaximum);
    } else if (a.exclusiveMaximum) {
        res.exclusiveMaximum = a.exclusiveMaximum;
    } else if (b.exclusiveMaximum) {
        res.exclusiveMaximum = b.exclusiveMaximum;
    }

    if (res.exclusiveMinimum && res.exclusiveMaximum && res.exclusiveMinimum > res.exclusiveMaximum) {
        return undefined;
    }

    if (a.multipleOf && b.multipleOf && a.multipleOf === b.multipleOf) {
        res.multipleOf = a.multipleOf;
    } else if (a.multipleOf) {
        res.multipleOf = a.multipleOf;
    } else if (b.multipleOf) {
        res.multipleOf = b.multipleOf;
    } else if (a.multipleOf && b.multipleOf && a.multipleOf !== b.multipleOf) {
        return undefined;
    }

    return res;

}


function mergeBoolean(a: any, b: any): any {

    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    return {
        type: 'boolean'
    }

}


function mergeNull(a: any, b: any): any {

    if (a === undefined) {
        return b;
    }

    if (b === undefined) {
        return a;
    }

    return {
        type: 'null'
    }

}

