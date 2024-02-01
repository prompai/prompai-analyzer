import {
    AnalysisContext,
    IUiAnalyzer
} from "./ui-analyzer";
import {AnalyzeError} from "../../utils/error";
import {validateVariableName} from "../../utils/validators";


type ValidateFunction = (analyzer: IUiAnalyzer, ctx: AnalysisContext) => void;

type ReturnFunction = (def: any, items?: any) => any;

type TypeDefinition = {
    validate: ValidateFunction,
    return: ReturnFunction,
    type: 'object',
    required: string[],
    canGeneric: boolean,
    properties: {
        [key: string]: any
    },
    [key: string]: any
}


const _name = {
    type: 'string',
    pattern: '^[a-zA-Z0-9_]+$',
    minLength: 2,
    maxLength: 64,
    canBeParameter: true
}


const _label = {
    type: 'string',
    minLength: 2,
    maxLength: 64,
    canBeParameter: true
}

const _description = {
    type: 'string',
    maxLength: 1024,
    canBeParameter: true
}

const _required = {
    "#comment": "evaluated at runtime",
    type: 'string',
    default: "true",
    canBeParameter: true
}


const _disabled = {
    "#comment": "evaluated at runtime",
    type: 'string',
    default: "false",
    canBeParameter: true
}




const _basics = {
    type: {
        type: 'string',
    },
    name: _name,
    label: _label,
    description: _description,
    required: _required,
    disabled: _disabled,
}

const _placeholder = {
    type: 'string',
    maxLength: 256,
    canBeParameter: true,
    minLength: 4
}

const _basicRequired = ['name', 'type'];

const _generic = {
    type: 'object',
    properties: {
        unique: {
            type: 'boolean',
            default: false
        },
        minItems: {
            type: 'number',
            min: 0
        },
        maxItems: {
            type: 'number',
            min: 0
        },
    },
}


export const typeDefinitions: { [key: string]: TypeDefinition } = {
    'i-text': {
        validate(analyzer: IUiAnalyzer, ctx: AnalysisContext) {
            const maxLength = analyzer.getProp('maxLength', ctx);
            const minLength = analyzer.getProp('minLength', ctx);
            if (maxLength) {
                if (maxLength.defined && maxLength.value) {
                    if (maxLength.value < 0) {

                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_min,
                            {
                                name: 'maxLength',
                                min: 0
                            }
                        ), 'maxLength');
                    }
                }
            }

            if (minLength) {
                if (minLength.defined && minLength.value) {
                    if (minLength.value < 0) {


                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_min,
                            {
                                name: 'minLength',
                                min: 0
                            },
                        ), 'minLength');

                    }
                }
            }

            if (maxLength && minLength) {
                if (maxLength.defined && maxLength.value && minLength.defined && minLength.value) {
                    if (maxLength.value < minLength.value) {


                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_max,
                            {
                                name: 'maxLength',
                                max: minLength.value
                            },
                        ), 'maxLength');

                    }
                }
            }

            const pattern = analyzer.getProp('pattern', ctx);

            if (pattern) {
                if (pattern.defined && pattern.value) {
                    try {
                        new RegExp(pattern.value);
                    } catch (e) {


                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_pattern_prop,
                            {
                                name: 'pattern',
                                pattern: pattern.value
                            },
                        ), 'pattern');

                    }
                }
            }

            const def = analyzer.getProp('default', ctx);

            if (def && def.defined && def.value) {
                if (maxLength && maxLength.defined && maxLength.value) {
                    if (def.value.length > maxLength.value) {
                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_length,
                            {
                                name: 'default',
                                max: maxLength.value
                            },
                        ), 'default')
                    }
                }

                if (minLength && minLength.defined && minLength.value) {
                    if (def.value.length < minLength.value) {


                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_length,
                            {
                                name: 'default',
                                min: minLength.value
                            },
                        ), 'default')

                    }
                }
            }

        },
        type: 'object',
        properties: {
            ..._basics,
            generic: _generic,
            placeholder: _placeholder,
            minLength: {
                type: 'number',
                min: 0,
                canBeParameter: true
            },
            maxLength: {
                type: 'number',
                min: 0,
                canBeParameter: true
            },
            pattern: {
                type: 'string',
                maxLength: 2048,
                canBeParameter: true
            },
            default: {
                type: 'string',
                maxLength: 256,
                canBeParameter: true
            },
            multiline: {
                type: 'boolean',
                default: false,
                canBeParameter: true
            },
            password: {
                type: 'boolean',
                default: false,
                canBeParameter: true
            },
            disabled: {
                "#comment": "evaluated at runtime",
                type: 'string',
                default: 'false',
                canBeParameter: true
            },
        },
        required: [..._basicRequired, 'label', 'placeholder'],
        canGeneric: true,
        return(def: any) {
            return {
                type: 'string',
                minLength: def.minLength,
                maxLength: def.maxLength,
                pattern: def.pattern,
                default: def.default
            }
        }
    },
    'for': {
        type: 'object',
        properties: {
            ..._basics,
            array: {
                type: 'array',
                canBeParameter: true,
                items: {
                    type: 'any'
                }
            },
            as: {
                type: 'string',
                canBeParameter: false
            },
            indexAs: {
                type: 'string',
                canBeParameter: false
            },
            minItems: {
                type: 'number',
                canBeParameter: true,
                min: 0
            },
            maxItems: {
                type: 'number',
                canBeParameter: true,
                min: 0
            },
            items: {
                type: 'array',
                "#comment": "same as ui-input",
                canBeParameter: false
            }
        },
        required: ['label', ..._basicRequired, 'array', 'as', 'items'],
        canGeneric: false,
        return(def: any, items: any) {
            if (!items) {
                throw new Error('items is required');
            }

            return {
                type: 'array',
                minItems: def.minItems,
                maxItems: def.maxItems,
                items: items
            }
        },
        validate(analyzer: IUiAnalyzer, ctx: AnalysisContext) {
            const minItems = analyzer.getProp('minItems', ctx);
            const maxItems = analyzer.getProp('maxItems', ctx);
            const array = analyzer.getProp('array', ctx);


            if (minItems) {
                if (minItems.defined && minItems.value) {
                    if (minItems.value < 0) {
                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_min,
                            {
                                name: 'minItems',
                                min: 0
                            },
                        ), 'minItems')
                    }
                }

                if (array?.isPlaceholder !== true) {
                    ctx.addError(new AnalyzeError(
                        AnalyzeError.errors.invalid_property,
                        {
                            name: 'array',
                            description: 'minItems only available when array is placeholder'
                        }
                    ));
                }

            }

            if (maxItems) {
                if (maxItems.defined && maxItems.value) {
                    if (maxItems.value < 0) {
                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_min,
                            {
                                name: 'maxItems',
                                min: 0
                            },
                        ), 'maxItems')
                    }
                }


                if (array?.isPlaceholder !== true) {
                    ctx.addError(new AnalyzeError(
                        AnalyzeError.errors.invalid_property,
                        {
                            name: 'array',
                            description: 'maxItems only available when array is placeholder'
                        }
                    ));
                }
            }


            if (minItems && maxItems) {
                if (minItems.defined && minItems.value && maxItems.defined && maxItems.value) {
                    if (minItems.value > maxItems.value) {
                        ctx.addError(new AnalyzeError(
                            AnalyzeError.errors.invalid_max,
                            {
                                name: 'maxItems',
                                max: minItems.value
                            },
                        ), 'maxItems')
                    }
                }
            }


            const as = analyzer.getProp('as', ctx);

            if (as && as.defined && as.value) {
                try {
                    validateVariableName(as.value);
                } catch (e) {
                    if (e instanceof AnalyzeError) ctx.addError(e as AnalyzeError, 'as');
                    throw e;
                }
            }

            const indexAs = analyzer.getProp('indexAs', ctx);

            if (indexAs && indexAs.defined && indexAs.value) {
                try {
                    validateVariableName(indexAs.value);
                } catch (e) {
                    if (e instanceof AnalyzeError) ctx.addError(e as AnalyzeError, 'indexAs');
                    throw e;
                }
            }


        }
    }
};