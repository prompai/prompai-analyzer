

export type TextSize = 'small' | 'medium' | 'large' | 'x-large' | 'xx-large';
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'light' | 'lighter';
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through' | 'blink';
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';
export type TextAlign = 'left' | 'right' | 'center' | 'justify';
export type TextDirection = 'ltr' | 'rtl' | 'inherit';
export type BlockDisplay = 'inline-block' | 'block';

export type Styles = TextSize | FontStyle | FontWeight | TextDecoration | TextTransform | TextAlign | TextDirection | BlockDisplay;


export interface RichTextItem {
    styles: Styles[];
    value: string;
}


type TextEqual = string | (RichTextItem | string)[];

export type UiOutputTypeNames = 'o-text';

export interface UiOutputItem<T = UiOutputTypeNames> {
    type: T;
}

export interface TextOutput extends UiOutputItem<'o-text'> {
    text: TextEqual;
    styles?: Styles[];
}

export type UiOutputItems = TextOutput;
