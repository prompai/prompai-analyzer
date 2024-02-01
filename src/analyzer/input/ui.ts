import {AnalyzeError} from "../../utils/error";
import {mergeSchema} from "../../utils/merge_schema";
import {schemaValidate} from "../../utils/schema_validate";
import {AnalysisContext, IUiAnalyzer, setCtx} from "./ui-analyzer";
import {typeDefinitions} from "./schemas";
import {
    hasPlaceholder,
    onlyPlaceholder,
    placeholderName,
    placeholderNames
} from "../../utils/placeholder";


export class UiAnalyzer implements IUiAnalyzer {
    get ctx(): AnalysisContext {
        return this._ctx!;
    }


    constructor(
        public items: any[],
        public params: {
            [key: string]: any
        },
        public allowInput: boolean,
        public parent?: UiAnalyzer,
        public parentAs?: string,
        public indexAs?: string,
        public parentCtx?: AnalysisContext
    ) {


        if (!items) {
            this.errors.push({
                message: 'items is undefined'
            });
            return;
        }

        if (!Array.isArray(items)) {
            this.errors.push({
                message: 'items is not an array'
            });
            return;
        }

        if (items.length === 0) {
            this.errors.push({
                message: 'items is empty'
            });
            return;
        }

        this.currentDefinition = items[0];


        if (parent) {
            this._ctx = parentCtx!.fork([]);
        } else {

            this._ctx = {
                location: [],
            } as unknown as AnalysisContext;


            setCtx(this, this._ctx);
        }

    }


    currentDefinition: any = null;


    addError(error: AnalyzeError, location: string[]) {
        error.location = [...this.ctx.location, ...location];
        this.errors.push(error);
    }

    errors: any[] = [];

    private readonly _ctx: AnalysisContext | undefined = undefined;

    /**
     * key can be something like "data.name", "input.age", "data.foo.bar.baz", "input.foo.bar.baz", "user.addresses.0.street"
     * */
    static hasParamToPlaceholder(parts: string[], properties: {
        [key: string]: any
    }, required: string[]): "has" | "has-not" | "maybe" {

        if (parts.length === 0) {
            return "has-not";
        }


        if (parts.length === 1) {
            if (properties[parts[0]] === undefined) {
                return "has-not";
            }

            return required.indexOf(parts[0]) >= 0 ? "has" : "maybe";
        }


        const prop = properties[parts[0]];

        if (prop === undefined) {
            return "has-not";
        }

        if (prop.type === 'object') {
            const r = UiAnalyzer.hasParamToPlaceholder(parts.slice(1), prop.properties, prop.required || []);

            console.log("sec has", parts, r);

            if (r === 'has-not') {
                return "has-not";
            }

            if (r === 'has') {
                return required.indexOf(parts[0]) >= 0 ? "has" : "maybe";
            }

            return "maybe";


        }

        if (prop.type === 'array') {

            if (isNaN(parseInt(parts[1]))) {
                return "has-not";
            }

            const r = UiAnalyzer.hasParamToPlaceholder(parts.slice(2), prop.items.properties, prop.items.required || []);

            if (r === 'has-not') {
                return "has-not";
            }

            return required.indexOf(parts[0]) >= 0 ? "has" : "maybe";

        }


        const r = UiAnalyzer.hasParamToPlaceholder(parts.slice(1), properties[parts[0]].properties, required);

        if (r === 'has-not') {
            return "has-not";
        }

        return required.indexOf(parts[0]) >= 0 ? "has" : "maybe";

    }

    static addRequiredTo(required: string[], item?: string) {

        if (!item) {
            return;
        }

        if (required.indexOf(item) < 0) {
            required.push(item);
        }
    }

    addParam(key: string, expectedType: any, ctx: AnalysisContext): void {


        const topParts = key.trim().split(' ');


        if (topParts.length === 1) {
        } else if (topParts.length === 3) {
            throw new Error('unimplemented');
            /*if (topParts[1] !== '||') {
                throw new Error('invalid key');
            }*/
        } else {
            throw new Error('invalid key');
        }


        const parts = topParts[0].split('.');


        if (topParts.length > 1 && !parts.some(p => p.endsWith('?'))) {
            parts[parts.length - 1] = parts[parts.length - 1] + '?';
        }

        if (parts[0] === 'data') {

            if (this.parent) {
                return this.parent.addParam(key, expectedType, ctx);
            }


            UiAnalyzer.addRequiredTo(this.params.required, UiAnalyzer._addDataParam(parts, this.params, expectedType))


            return;
        }


        if (this.parent) {
            // check as , indexAs
            if (parts[0] === this.parentAs!) {
                UiAnalyzer._addDataParam(parts, this.params, expectedType);
            } else if (parts[0] === this.indexAs) {
                UiAnalyzer._addDataParam(parts, this.params, expectedType);
            } else {
                return this.parent.addParam(key, expectedType, ctx);
            }
        }


        const h = UiAnalyzer.hasParamToPlaceholder(parts, this.params.properties, this.params.required);

        if (h === 'has-not') {
            throw new Error('invalid key');
        }

        if (h === 'has') {
            return;
        }

        if (h === 'maybe') {

            /*if (topParts.length === 3) {
                return;
            } else*/ {

                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.can_be_null,
                    {
                        name: parts.join('.')
                    },
                ));

            }

        }

    }


    // Creates schema for data parameters
    static _addDataParam(parts: string[], schema: {
        [key: string]: any
    }, expectedType: any): string | undefined {


        if (parts.length === 0) {
            throw new Error('invalid key');
        }


        let p = parts[0];

        const isPNullable = p.endsWith('?');

        if (expectedType && expectedType.canBeParameter) {
            expectedType = {
                ...expectedType
            };
            delete expectedType.canBeParameter;
        }

        p = p.replace(/\?$/, '');

        if (parts.length === 1) {


            if (schema.properties === undefined) {
                schema.properties = {};
            }

            if (schema.required === undefined) {
                schema.required = [];
            }

            if (!schema.type) {
                schema.type = 'object';
            }

            if (schema.properties[p] === undefined) {
                schema.properties[p] = expectedType || {
                    type: 'any'
                };

                if (!isPNullable) {
                    schema.required = [
                        ...schema.required || [],
                        p
                    ]
                }
            } else {

                const prop = schema.properties[p];


                if (Object.keys(prop).length === 0) {
                    schema.properties[p] = expectedType || {
                        type: 'any'
                    };
                    return isPNullable ? undefined : p;
                }

                if (prop.type === 'any') {

                    if (expectedType !== undefined) {
                        schema.properties[p] = mergeSchema(prop, expectedType);
                    } else {
                        schema.properties[p] = {
                            type: 'any'
                        }
                    }

                    if (!isPNullable) {

                        schema.required = mergeSchema((schema.required ?? []), [p])

                    }

                    return isPNullable ? undefined : p;
                } else {


                    if (expectedType === undefined) {
                        return isPNullable ? undefined : p;
                    }


                    if (objRecursiveEqual(prop, expectedType)) {
                        return isPNullable ? undefined : p;
                    }


                    if (prop.type === 'object') {
                        if (expectedType.type === 'object') {
                            schema.properties[p] = mergeSchema(prop, expectedType);
                            return isPNullable ? undefined : p;
                        }
                    }

                    if (prop.type === 'array') {
                        if (expectedType.type === 'array') {
                            schema.properties[p] = mergeSchema(prop, expectedType);
                            return isPNullable ? undefined : p;
                        }
                    }


                    throw new Error('invalid key');

                }

            }


            return isPNullable ? undefined : p;
        }


        if (schema.type === 'object') {

            if (schema.properties === undefined) {
                schema.properties = {};
            }

            if (schema.properties[p] === undefined) {

                if (isNaN(parseInt(parts[1]))) {
                    schema.properties[p] = {
                        type: 'object',
                        properties: {},
                        required: []
                    }
                } else {
                    schema.properties[p] = {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    }
                }
            }

            if (schema.properties[p].type === 'object') {

                UiAnalyzer.addRequiredTo(schema.properties[p].required, UiAnalyzer._addDataParam(parts.slice(1), schema.properties[p], expectedType));


                return isPNullable ? undefined : p;

            } else {
                UiAnalyzer._addDataParam(parts.slice(2), schema.properties[p].items, expectedType);

                return isPNullable ? undefined : p;
            }
        }

        throw new Error('invalid key');

    }


    getProp(prop: string, ctx: AnalysisContext): {
        defined: boolean,
        isPlaceholder?: boolean,
        hasPlaceholder?: boolean,
        placeholderName?: string,
        default?: any,
        value?: any,
    } | undefined {
        const p = this.currentDefinition[prop];

        const schema = (typeDefinitions)[this.currentDefinition.type];


        const schemaDefault = schema.properties[prop].default;

        if (p === undefined) {

            if (schema.required.indexOf(prop) >= 0) {

                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.missing_property,
                    {
                        name: prop
                    },
                ));

                return undefined;
            }


            return {
                defined: false,
                value: schemaDefault
            }
        }


        const hasPlc = typeof p === "string" && hasPlaceholder(p);

        if (hasPlc) {

            if (schema.properties[prop].canBeParameter !== true) {


                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.propertyCannotParameter,
                    {
                        name: prop
                    },
                ));


                return undefined;
            }


            if (onlyPlaceholder(p)) {
                return {
                    defined: true,
                    isPlaceholder: true,
                    hasPlaceholder: true,
                    placeholderName: placeholderName(p)?.paramName
                }
            } else {
                return {
                    defined: true,
                    hasPlaceholder: true,
                }
            }
        }

        // TODO: Check if the developer define default value, check the default value type

        return {
            defined: true,
            value: p
        }
    }

    checkSchema(schema: any, val: any, req: boolean, ctx: AnalysisContext, name: string): void {

        if (!schema) {
            throw new Error('schema is undefined');
        }


        if (!val) {

            if (req) {

                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.missing_property,
                    {
                        name: name
                    },
                ));

            }

            return;
        }

        if (!schema.type) {
            throw new Error('schema.type is undefined');
        }

        if (schema.type === 'object') {
            const properties = schema.properties;
            const required = schema.required || [];


            if (typeof val !== 'object') {

                if (typeof val === 'string') {
                    if (onlyPlaceholder(val) && schema.canBeParameter) {
                        this.addParam(placeholderName(val)?.paramName!, schema, ctx);
                        return;
                    }
                }

                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: name,
                        type: 'object'
                    },
                ));

                return;

            }


            const keys = Object.keys(properties);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const prop = properties[key];

                if (!prop) {

                    ctx.addError(new AnalyzeError(
                        `invalid property "${key}"`,
                        [key]
                    ));

                    continue;
                }

                this.checkSchema(prop, val[key], required.indexOf(key) >= 0, ctx.fork([key]), key);
            }

            return;


        } else if (schema.type === 'array') {


            if (typeof val === 'string') {
                if (onlyPlaceholder(val) && schema.canBeParameter) {
                    const n = placeholderName(val);
                    this.addParam(n?.paramName!, schema, ctx);
                    return;
                }
            }


            if (!Array.isArray(val)) {

                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: name,
                        type: 'array'
                    },
                ));

                return;
            }

            const items = schema.items ?? {
                type: 'any'
            };


            for (let i = 0; i < val.length; i++) {
                this.checkSchema(items, val[i], true, ctx.fork([i.toString()]), i.toString());
            }

            return;

        } else {

            if (schema.type === 'string') {
                if (hasPlaceholder(val)) {
                    if (schema.canBeParameter ?? true) {
                        const names = placeholderNames(val);
                        if (names) {
                            for (let i = 0; i < names.length; i++) {
                                this.addParam(names[i], {
                                    type: 'any'
                                }, ctx);
                            }
                            return;
                        }
                    }
                }
            }

            if (typeof val === 'string') {
                if (onlyPlaceholder(val) && schema.canBeParameter) {
                    this.addParam(placeholderName(val)?.paramName!, schema, ctx);
                    return;
                }
            }

            if ((schema.type ?? 'any') === 'any') {
                return;
            } else if (typeof val !== schema.type) {
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: name,
                        type: schema.type
                    },
                ));

                return;
            }


            try {
                schemaValidate(schema, val, req, name);
            } catch (e) {
                if (e instanceof AnalyzeError) {
                    ctx.addError(e);
                } else {
                    throw e;
                }
            }
        }
    }


    analyze() {

        if (!this.params.type) {
            this.params.type = 'object';
            this.params.properties = {
                input: {
                    type: 'object',
                    properties: {},
                    required: []
                },
                data: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            };
            this.params.required = [
                'input'
            ];
        }

        if (!this.items) {
            this.errors.push({
                message: 'items is undefined'
            });
            return;
        }


        if (!Array.isArray(this.items)) {
            this.errors.push({
                message: 'items is not an array'
            });
            return;
        }

        if (this.items.length === 0) {
            this.errors.push({
                message: 'items is empty'
            });
            return;
        }

        for (let i = 0; i < this.items.length; i++) {
            this.analyzeDefinition(this.items[i], this.ctx.fork(['items', i.toString()]))
        }


    }


    analyzeDefinition(definition: any, ctx: AnalysisContext) {


        this.currentDefinition = definition;


        this.checkItem(definition, ctx);


        const type = definition.type;

        if (!type) {

            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.missing_property,
                {
                    name: 'type'
                },
            ));

            return;
        }


        const schema = typeDefinitions[type];

        if (!schema) {

            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.unknown_type,
                {
                    name: 'type',
                    type: type
                },
            ));

            return;
        }


        if (!this.allowInput && type.startsWith('i-')) {
            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.input_not_allowed,
                {}
            ));
            return;
        }


        this.checkSchema(schema, definition, true, ctx, '');

        if (schema.validate) {
            schema.validate(this, ctx);
        }


        if (definition.type === 'for') {
            this.analyzeFor(ctx);
            return;
        }

        if (definition.name.startsWith('o-')) {
            return;
        }

        let ret = schema.return(definition);

        if (!ret) {
            throw new Error('return is undefined');
        }

        const generic = this.getProp('generic', ctx);

        if(generic && generic.defined && generic.value){

            const min = generic.value.minItems;
            const max = generic.value.maxItems;

            if(min !== undefined && typeof min !== 'number'){
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: 'generic.minItems',
                        type: 'number'
                    },
                ));
                return;
            }

            if(max !== undefined && typeof max !== 'number'){
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: 'generic.maxItems',
                        type: 'number'
                    },
                ));
                return;
            }

            if(min !== undefined && max !== undefined && min > max){
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_min_max_items,
                    {
                        name: 'generic',
                        min: min,
                        max: max
                    },
                ));
                return;
            }

            if(min !== undefined && min < 0){
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_min_items,
                    {
                        name: 'generic',
                        min: min
                    },
                ));
                return;
            }

            if(max !== undefined && max < 0){
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_max_items,
                    {
                        name: 'generic',
                        max: max
                    },
                ));
                return;
            }

            if (min !== undefined && max !== undefined && min > max) {
                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_min_max_items,
                    {
                        name: 'generic',
                        min: min,
                        max: max
                    },
                ));
                return;
            }

            ret = {
                type: 'array',
                minItems: generic.value.minItems,
                maxItems: generic.value.maxItems,
                items: ret,
                uniqueItems: generic.value.unique
            }
        }

        this.params.properties.input.properties[definition.name] = ret;

        const req = this.getProp('required', ctx);

        if (req && req.defined && req.value) {
            if (req.value === 'true'){
                const dis = this.getProp('disabled', ctx);
                if (dis && dis.defined && dis.value === 'true'){
                    ctx.addError(new AnalyzeError(
                        AnalyzeError.errors.required_and_disabled,
                        {
                            name: definition.name
                        },
                    ));
                }
                this.params.properties.input.required.push(definition.name);
            }
        } else {
            this.params.properties.input.required.push(definition.name);
        }


    }


    checkItem(definition: any, ctx: AnalysisContext) {
        // check name and type is set


        const type = definition.type;

        if (!type) {

            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.missing_property,
                {
                    name: 'type'
                },
            ));

            return;
        }

        if (typeof type !== 'string') {

            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.invalid_type,
                {
                    name: 'type',
                    type: 'string'
                },
            ));

            return;
        }

        if (typeDefinitions[type] === undefined) {

            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.unknown_type,
                {
                    name: 'type',
                    type: type
                },
            ));

            return;
        }

        if (definition.name.startsWith('o-') || definition.name === 'for') {
            return;
        }


        const name = definition.name;

        if (!name) {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.missing_property,
                {
                    name: 'name'
                },
            ));


            return;
        }

        if (typeof name !== 'string') {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.invalid_type,
                {
                    name: 'name',
                    type: 'string'
                },
            ));

            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(name)) {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.invalid_pattern,
                {
                    name: 'name',
                    pattern: '^[a-zA-Z0-9_]+$'
                },
            ));


            return;
        }


    }


    analyzeFor(ctx: AnalysisContext) {


        const subItems = this.getProp('items', ctx);

        if (!subItems || !subItems.defined || !subItems.value) {
            return;
        }

        if (!Array.isArray(subItems.value)) {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.invalid_type,
                {
                    name: 'items',
                    type: 'array'
                },
            ));


            return;
        }

        if (subItems.value.length === 0) {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.invalid_min_items,
                {
                    name: 'items',
                    min: 1
                },
            ));


            return;
        }

        const as = this.currentDefinition.as;
        const indexAs = this.currentDefinition.indexAs;

        if (!as) {


            ctx.addError(new AnalyzeError(
                AnalyzeError.errors.missing_property,
                {
                    name: 'as'
                },
            ));

            return;
        }


        const subCtx = new UiAnalyzer(subItems.value, {
            type: 'object',
            properties: {
                input: {
                    type: 'object',
                    properties: {},
                    required: []
                },
                [as]: {}
            },
            required: [
                as,
                'input',
                'data'
            ]
        }, this.allowInput, this, as, indexAs, ctx);


        subCtx.analyze();


        if (subCtx.errors.length > 0) {
            this.errors.push(...subCtx.errors);
            return;
        }
        const minItems = this.getProp('minItems', ctx);
        const maxItems = this.getProp('maxItems', ctx);

        const min = minItems?.value ?? 0;
        const max = maxItems?.value;

        if (this.allowInput) {

            const name = this.currentDefinition.name;


            this.params.properties.input.properties[name] = {
                type: 'array',
                minItems: min,
                itemAs: as,
                items: {
                    type: 'object',
                    properties: subCtx.params.properties.input.properties,
                    required: subCtx.params.properties.input.required
                }
            }



            if (max) {
                this.params.properties.input.properties[name].maxItems = max;
            }

            this.params.properties.input.required.push(name);
        }


        const asSchema: any = {
            type: 'array',
            minItems: min,
            items: subCtx.params.properties[as]
        };

        if (max) {
            asSchema.maxItems = max;
        }


        if (typeof this.currentDefinition.array === 'string') {
            if (onlyPlaceholder(this.currentDefinition.array)) {
                const n = placeholderName(this.currentDefinition.array);
                this.addParam(n?.paramName!, asSchema, ctx);
                if (this.allowInput) {
                    const name = this.currentDefinition.name;

                    this.params.properties.input.properties[name].forEach = n?.paramName!;
                }

            } else {


                ctx.addError(new AnalyzeError(
                    AnalyzeError.errors.invalid_type,
                    {
                        name: 'array',
                        type: 'string'
                    },
                ));

                return;
            }
        } else {


            if (this.allowInput) {
                const name = this.currentDefinition.name;
                this.params.properties.input.properties[name].forEach = this.currentDefinition.array;
            }

            this.checkSchema(asSchema, this.currentDefinition.array, true, ctx.fork(['array']), 'array');
        }


    }

}


function objRecursiveEqual(a: any, b: any): boolean {

    if (a === b) {
        return true;
    }

    if (a === null || b === null) {
        return false;
    }

    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    for (let i = 0; i < aKeys.length; i++) {
        const key = aKeys[i];

        if (b[key] === undefined) {
            return false;
        }

        if (!objRecursiveEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;

}


