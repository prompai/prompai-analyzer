import { Styles, UiOutputItems } from "./ui-output";

const sizes = ['small', 'medium', 'large', 'x-large', 'xx-large'];
const styles = ['normal', 'italic', 'oblique'];
const weights = ['normal', 'bold', 'bolder', 'light', 'lighter'];
const decorations = ['none', 'underline', 'overline', 'line-through', 'blink'];
const transforms = ['none', 'capitalize', 'uppercase', 'lowercase'];
const aligns = ['left', 'right', 'center', 'justify'];
const directions = ['ltr', 'rtl', 'inherit'];
const displays = ['inline-block', 'block'];

const allStyles = [sizes, styles, weights, decorations, transforms, aligns, directions, displays] as Styles[][];

export function isValidStyle(style: Styles[]) {
    return allStyles.every((s) => {
        const count = s.filter((ss) => {
            return style.indexOf(ss) !== -1;
        });

        return count.length <= 1;
    });
}


export interface UiOutput {
    items: UiOutputItems[];
}

export interface JsonOutput {
    schema: any;
}

export interface FormDataOutput {
    schema: any;
}

export interface BinaryOutput {
    contentType: string;
}

export type Output = UiOutput | JsonOutput | FormDataOutput | BinaryOutput;
