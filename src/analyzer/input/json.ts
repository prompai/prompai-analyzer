import { JsonInput } from "../../models/input";
import {AnalyzeError} from "../../utils/error";


export function analyzeJsonInput(input: JsonInput) : {
    errors?: AnalyzeError[],
    params?: any
} {
    throw new Error('Not implemented');
}