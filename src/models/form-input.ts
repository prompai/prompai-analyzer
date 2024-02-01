import {Input} from "./input-base";

export  type FormFieldTypeNames = "text" | "file";

export  interface FormField<T extends FormFieldTypeNames> {
    type: T;
    required?: boolean;
}

export interface FormFieldText extends FormField<"text"> {
    minlength?: number | string;
    maxlength?: number | string;
}


export interface FormFieldFile extends FormField<"file"> {
    accept: string[];
    minSize?: number;
    maxSize?: number;
}

export type FormFieldTypes = FormFieldText | FormFieldFile;

export interface FormDataInput extends Input<'form-data'> {
    schema: {
        [key: string]: FormFieldTypes;
    };
}


