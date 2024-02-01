import {AnalyzeError} from "../../utils/error";


export interface IUiAnalyzer {
    addError(error: AnalyzeError, location: string[]): void;

    getProp(prop: string, ctx: AnalysisContext): {
        defined: boolean,
        isPlaceholder?: boolean,
        placeholderName?: string,
        hasPlaceholder?: boolean,
        default?: any,
        value?: any,
    } | undefined;

    currentDefinition: any;

}


export  interface AnalysisContext {
    location: string[];

    analyzer: IUiAnalyzer;

    fork(loc: string[]): AnalysisContext;

    addError(error: AnalyzeError, loc?: string): void;

}

export function setCtx(analyzer: IUiAnalyzer, ctx: AnalysisContext) {

    ctx.analyzer = analyzer;

    ctx.fork = (loc) => {
        const c = {
            location: [...ctx.location, ...loc]
        } as AnalysisContext;

        setCtx(analyzer, c);

        return c;
    }

    ctx.addError = (error, loc) => {
        const l = loc ? [...ctx.location, loc] : ctx.location;
        analyzer.addError(error, l);
    }

}
