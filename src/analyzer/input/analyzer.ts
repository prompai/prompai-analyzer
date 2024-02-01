import { Input } from "../../models/input-base";
import { analyzeBinaryInput } from "./binary";
import { analyzeFormDataInput } from "./form";
import { analyzeJsonInput } from "./json";
import {UiAnalyzer} from "./ui";
import {UiInput} from "../../models/ui-input";
import {AnalyzeError} from "../../utils/error";
import {InputTypes} from "../../models/input";


export function analyzeInput(input: InputTypes) : {
    errors?: AnalyzeError[],
    params?: any
} {
    // TODO: add validation

    switch (input.type) {
        case 'ui':
            const i = input as UiInput;
            if (!i.items || !Array.isArray(i.items) || i.items.length === 0) {
                return {
                    errors: [
                        new AnalyzeError(
                            AnalyzeError.errors.missing_property,
                            {
                                name: 'items',
                            }
                        )
                    ]
                }
            }

            const analyzer = new UiAnalyzer(i.items, {}, true);

            analyzer.analyze();

            return {
                errors: analyzer.errors,
                params: analyzer.params
            }

        case 'json':
            return analyzeJsonInput(input as any);
        case 'form-data':
            return analyzeFormDataInput(input as any);
        case 'binary':
            return analyzeBinaryInput(input as any);
    }

    throw new Error('Not implemented');
}