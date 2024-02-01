import {AnalyzeError} from "./error";

const reservedNames = [
    'class',
    'constructor',
    'function',
    'interface',
    'let',
    'package',
    'private',
    'protected',
    'public',
    'static',
    'type',
    'var',
    'void',
    'user',
    'window',
    'with',
    'yield',
    'abstract',
    'arguments',
    'boolean',
    'break',
    'byte',
    'case',
    'catch',
    'char',
    'const',
    'continue',
    'debugger',
    'declare',
    'default',
    'delete',
    'do',
    'double',
    'else',
    'enum',
    'eval',
    'export',
    'extends',
    'false',
    'final',
    'finally',
    'float',
    'for',
    'goto',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'int',
    'is',
];


export function validateVariableName(name: string): void {
    if (!name) {
        throw new AnalyzeError(
            AnalyzeError.errors.missing_property,
            {
                name: 'name'
            });
    }

    if (name.length > 256) {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_maxLength,
            {
                name: 'name',
                maxLength: 256
            });
    }

    if (name.length < 1) {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_minLength,
            {
                name: 'name',
                minLength: 1
            }
        );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_pattern,
            {
                name: 'name',
                pattern: '^[a-zA-Z0-9_]+$',
                invalidText: 'must be a valid javascript identifier'
            }
        );
    }

    if (/^[0-9-_]/.test(name)) {
        throw new AnalyzeError(
            AnalyzeError.errors.invalid_pattern_prop,
            {
                name: 'name',
                pattern: '^[0-9-_]',
                invalidText: 'must be a valid javascript identifier'
            }
        );
    }


    if (reservedNames.indexOf(name) !== -1) {
        throw new AnalyzeError(
            AnalyzeError.errors.name_reserved,
            {
                name: 'name',
                value: name
            }
        );
    }

    return;
}